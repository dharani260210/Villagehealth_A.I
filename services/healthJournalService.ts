import { ref, push, set, onValue, off, get } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { HealthJournalEntry } from '../types';

// ─────────────────────────────────────────────
// Anonymous User Identity
// ─────────────────────────────────────────────

export function getAnonymousUserId(): string {
  const KEY = 'vh_anon_uid';
  let uid = localStorage.getItem(KEY);
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
    localStorage.setItem(KEY, uid);
  }
  return uid;
}

// ─────────────────────────────────────────────
// In-memory fallback store
// ─────────────────────────────────────────────

let demoEntries: HealthJournalEntry[] = [
  {
    id: 'demo-1',
    userId: 'demo',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    systolic: 128,
    diastolic: 82,
    bloodSugar: 108,
    temperature: 37.2,
    weight: 68,
    symptoms: 'Mild headache in the morning',
    notes: 'Took paracetamol 500mg',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'demo-2',
    userId: 'demo',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    systolic: 122,
    diastolic: 78,
    bloodSugar: 95,
    temperature: 36.8,
    weight: 68,
    symptoms: '',
    notes: 'Feeling better today',
    createdAt: Date.now() - 86400000,
  },
];

// ─────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────

/**
 * Add a new health journal entry for a user.
 */
export async function addJournalEntry(
  entry: Omit<HealthJournalEntry, 'id' | 'createdAt'>
): Promise<string> {
  const newEntry: HealthJournalEntry = { ...entry, createdAt: Date.now() };

  if (isFirebaseConfigured && db) {
    try {
      const newRef = push(ref(db, `journals/${entry.userId}`));
      await set(newRef, newEntry);
      return newRef.key!;
    } catch (e) {
      console.warn('Firebase journal write failed, using demo:', e);
    }
  }

  // Demo fallback
  await new Promise(r => setTimeout(r, 400));
  const id = 'entry-' + Date.now();
  demoEntries = [{ ...newEntry, id }, ...demoEntries];
  return id;
}

/**
 * Subscribe to real-time journal entries for a user (sorted newest first).
 */
export function subscribeToJournal(
  userId: string,
  callback: (entries: HealthJournalEntry[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const journalRef = ref(db, `journals/${userId}`);
    const handler = (snap: any) => {
      const entries: HealthJournalEntry[] = [];
      if (snap.exists()) {
        snap.forEach((child: any) => {
          entries.push({ id: child.key, ...child.val() } as HealthJournalEntry);
        });
      }
      callback(entries.sort((a, b) => b.createdAt - a.createdAt));
    };
    onValue(journalRef, handler);
    return () => off(journalRef, 'value', handler);
  }

  // Demo fallback: show demo entries
  callback([...demoEntries]);
  return () => {};
}

/**
 * Get all journal entries for a user (one-time read).
 */
export async function getJournalEntries(userId: string): Promise<HealthJournalEntry[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await get(ref(db, `journals/${userId}`));
      const entries: HealthJournalEntry[] = [];
      if (snap.exists()) {
        snap.forEach((child: any) => {
          entries.push({ id: child.key, ...child.val() } as HealthJournalEntry);
        });
      }
      return entries.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.warn('Firebase journal read failed:', e);
    }
  }
  return [...demoEntries];
}

/**
 * Interpret a blood pressure reading.
 */
export function interpretBP(systolic: number, diastolic: number): { label: string; color: string } {
  if (systolic < 90 || diastolic < 60) return { label: 'Low', color: 'text-blue-600' };
  if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-emerald-600' };
  if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: 'text-amber-500' };
  if (systolic < 140 || diastolic < 90) return { label: 'High Stage 1', color: 'text-orange-500' };
  return { label: 'High Stage 2', color: 'text-rose-600' };
}

/**
 * Interpret a blood sugar reading (mg/dL, fasting assumed).
 */
export function interpretBloodSugar(mgdl: number): { label: string; color: string } {
  if (mgdl < 70) return { label: 'Hypoglycemia', color: 'text-blue-600' };
  if (mgdl <= 100) return { label: 'Normal', color: 'text-emerald-600' };
  if (mgdl <= 125) return { label: 'Pre-diabetic', color: 'text-amber-500' };
  return { label: 'Diabetic Range', color: 'text-rose-600' };
}
