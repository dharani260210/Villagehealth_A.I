import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage } from '../types';
import { setupRecaptcha, sendOTP, verifyOTP } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebaseConfig';
import { ConfirmationResult } from 'firebase/auth';
import { Phone, Shield, X, CheckCircle, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (uid: string, phone: string) => void;
  language: SupportedLanguage;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onVerified, language }) => {
  const isTa = language.code === 'ta';
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && step === 'phone') {
      // Short delay to ensure DOM is ready
      setTimeout(() => setupRecaptcha('recaptcha-container'), 200);
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhone('');
      setOtp('');
      setError('');
      setConfirmation(null);
    }
  }, [isOpen]);

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError(isTa ? 'சரியான தொலைபேசி எண்ணை உள்ளிடுங்கள்' : 'Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullNumber = `+91${cleaned.slice(-10)}`;
      const result = await sendOTP(fullNumber);
      if (result) {
        setConfirmation(result);
        setStep('otp');
      } else {
        setError(isTa ? 'OTP அனுப்ப முடியவில்லை. Firebase Auth இயக்கப்பட்டுள்ளதா?' : 'Could not send OTP. Is Firebase Phone Auth enabled?');
      }
    } catch (e: any) {
      setError(e.message || (isTa ? 'OTP அனுப்பல் தோல்வி' : 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError(isTa ? '6-இலக்க OTP உள்ளிடுங்கள்' : 'Enter the 6-digit OTP');
      return;
    }
    if (!confirmation) return;
    setLoading(true);
    setError('');
    try {
      const uid = await verifyOTP(confirmation, otp);
      const fullPhone = `+91${phone.replace(/\D/g, '').slice(-10)}`;
      onVerified(uid, fullPhone);
      onClose();
    } catch (e: any) {
      setError(isTa ? 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.' : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-rose-100 p-2 rounded-xl">
              <Shield size={18} className="text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isTa ? 'தொலைபேசி சரிபார்ப்பு' : 'Phone Verification'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {isTa ? 'தொகுப்பு சேவைகளுக்கு OTP தேவை' : 'Required to post requests & register'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!isFirebaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                {isTa
                  ? 'Firebase தொடர்பு இல்லை. டெமோ முறையில் தொடரலாம்.'
                  : 'Firebase not connected. You can continue in demo mode.'}
              </p>
            </div>
          )}

          {step === 'phone' ? (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  {isTa ? 'இந்திய தொலைபேசி எண்' : 'Indian Mobile Number'}
                </label>
                <div className="flex space-x-2">
                  <div className="flex items-center bg-slate-100 rounded-xl px-3 text-sm font-bold text-slate-600 shrink-0">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="form-input flex-1"
                  />
                </div>
              </div>

              {/* Invisible reCAPTCHA container */}
              <div id="recaptcha-container" ref={recaptchaRef} />

              {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-bold transition-colors"
              >
                <Phone size={16} />
                <span>{loading ? (isTa ? 'அனுப்புகிறது...' : 'Sending...') : (isTa ? 'OTP அனுப்பவும்' : 'Send OTP')}</span>
              </button>

              <p className="text-center text-[10px] text-slate-400">
                {isTa
                  ? 'உங்கள் எண்ணுக்கு ஒரு OTP அனுப்பப்படும். தரவு பகிரப்படாது.'
                  : 'An OTP will be sent to your number. Data is not shared.'}
              </p>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  {isTa ? `+91 ${phone} க்கு OTP அனுப்பப்பட்டது` : `OTP sent to +91 ${phone}`}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  {isTa ? '6-இலக்க OTP' : '6-Digit OTP'}
                </label>
                <input
                  type="tel"
                  maxLength={6}
                  placeholder="_ _ _ _ _ _"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-input text-center text-xl font-black tracking-widest"
                  autoFocus
                />
              </div>

              {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-bold transition-colors"
              >
                <CheckCircle size={16} />
                <span>{loading ? (isTa ? 'சரிபார்க்கிறது...' : 'Verifying...') : (isTa ? 'OTP சரிபார்க்கவும்' : 'Verify OTP')}</span>
              </button>

              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="w-full text-center text-xs text-slate-400 hover:text-rose-600 py-1"
              >
                {isTa ? 'தொலைபேசி எண்ணை மாற்றவும்' : 'Change phone number'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
