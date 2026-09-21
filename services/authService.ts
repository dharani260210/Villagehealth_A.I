import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
} from 'firebase/auth';
import { getApp } from 'firebase/app';
import { isFirebaseConfigured } from './firebaseConfig';

let auth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (auth) return auth;
  try {
    auth = getAuth(getApp());
    return auth;
  } catch (e) {
    console.warn('[Auth] Could not initialize Firebase Auth:', e);
    return null;
  }
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Set up invisible reCAPTCHA on a container div.
 * Call once per page load, before sendOTP.
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier | null {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return null;
  try {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
      size: 'invisible',
      callback: () => {},
    });
    return recaptchaVerifier;
  } catch (e) {
    console.warn('[Auth] Recaptcha setup failed:', e);
    return null;
  }
}

/**
 * Send OTP to phone number (E.164 format e.g. +919876543210).
 */
export async function sendOTP(phoneNumber: string): Promise<ConfirmationResult | null> {
  const authInstance = getFirebaseAuth();
  if (!authInstance || !recaptchaVerifier) return null;
  try {
    const confirmationResult = await signInWithPhoneNumber(
      authInstance,
      phoneNumber,
      recaptchaVerifier
    );
    return confirmationResult;
  } catch (e: any) {
    console.error('[Auth] sendOTP failed:', e);
    throw new Error(e?.message || 'Failed to send OTP. Check the phone number.');
  }
}

/**
 * Verify the OTP code entered by the user.
 */
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<string> {
  try {
    const result = await confirmationResult.confirm(code);
    return result.user.uid;
  } catch (e: any) {
    throw new Error('Invalid OTP code. Please try again.');
  }
}

/**
 * Get the currently signed-in user UID (null if not signed in).
 */
export function getCurrentUserUID(): string | null {
  const authInstance = getFirebaseAuth();
  return authInstance?.currentUser?.uid || null;
}

/**
 * Get display phone number of current user.
 */
export function getCurrentUserPhone(): string | null {
  const authInstance = getFirebaseAuth();
  return authInstance?.currentUser?.phoneNumber || null;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const authInstance = getFirebaseAuth();
  if (authInstance?.currentUser) {
    const { signOut: fbSignOut } = await import('firebase/auth');
    await fbSignOut(authInstance);
  }
}
