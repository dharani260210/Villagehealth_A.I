/**
 * VillageHealth AI — Firebase Cloud Function Scaffold
 * Automated SMS & Push Notification Dispatcher for Critical Blood Requests
 * 
 * Deployment Instructions:
 * 1. Ensure Firebase CLI is installed: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Initialize functions: firebase init functions
 * 4. Add Fast2SMS API Key to environment: firebase functions:config:set fast2sms.key="YOUR_KEY"
 * 5. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');

admin.initializeApp();

/**
 * Triggered on every new urgent blood request posted to RTDB
 */
exports.onBloodRequestCreated = functions.database
  .ref('/bloodRequests/{requestId}')
  .onCreate(async (snapshot, context) => {
    const request = snapshot.val();
    if (!request) return null;

    console.log(`[VillageHealth] New blood request received: ${request.bloodType} in ${request.district}`);

    // Only broadcast automated SMS/FCM for CRITICAL or URGENT requests
    if (request.urgency !== 'CRITICAL' && request.urgency !== 'URGENT') {
      return null;
    }

    const { bloodType, district, hospital, units, contactPhone, patientName } = request;

    // 1. Send FCM Push Notifications to registered devices in this district
    try {
      const tokensSnap = await admin.database().ref('/fcmTokens').once('value');
      const tokens = [];

      if (tokensSnap.exists()) {
        tokensSnap.forEach((child) => {
          const item = child.val();
          if (item.district === district || item.district === 'All') {
            tokens.push(item.token);
          }
        });
      }

      if (tokens.length > 0) {
        const payload = {
          notification: {
            title: `🚨 CRITICAL: ${bloodType} Blood Needed in ${district}`,
            body: `${units} unit(s) needed at ${hospital} for patient ${patientName}. Call: ${contactPhone}`,
          },
          data: {
            requestId: context.params.requestId,
            bloodType,
            district,
          },
        };

        const response = await admin.messaging().sendToDevice(tokens, payload);
        console.log(`[FCM] Push sent to ${response.successCount}/${tokens.length} devices.`);
      }
    } catch (fcmErr) {
      console.error('[FCM] Error sending push notifications:', fcmErr);
    }

    // 2. Broadcast SMS via Fast2SMS API (for registered donors without app open)
    const FAST2SMS_KEY = process.env.FAST2SMS_KEY || (functions.config().fast2sms && functions.config().fast2sms.key);

    if (FAST2SMS_KEY) {
      try {
        const donorsSnap = await admin.database().ref('/donors').once('value');
        const donorPhones = [];

        if (donorsSnap.exists()) {
          donorsSnap.forEach((child) => {
            const donor = child.val();
            if (donor.district === district && donor.bloodType === bloodType && donor.available) {
              donorPhones.push(donor.phone.replace(/\D/g, '').slice(-10));
            }
          });
        }

        if (donorPhones.length > 0) {
          const message = `EMERGENCY: Urgent ${bloodType} blood needed at ${hospital}, ${district}. Please contact ${contactPhone} if you can donate. - VillageHealth AI`;
          
          const postData = JSON.stringify({
            route: 'q',
            message: message,
            language: 'english',
            numbers: donorPhones.join(','),
          });

          const options = {
            hostname: 'www.fast2sms.com',
            port: 443,
            path: '/dev/bulkV2',
            method: 'POST',
            headers: {
              'authorization': FAST2SMS_KEY,
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
          };

          const req = https.request(options, (res) => {
            res.on('data', (d) => process.stdout.write(d));
          });

          req.on('error', (e) => console.error('[Fast2SMS] Error:', e));
          req.write(postData);
          req.end();

          console.log(`[Fast2SMS] Broadcast dispatched to ${donorPhones.length} matching donors.`);
        }
      } catch (smsErr) {
        console.error('[Fast2SMS] Error dispatching SMS:', smsErr);
      }
    }

    return null;
  });
