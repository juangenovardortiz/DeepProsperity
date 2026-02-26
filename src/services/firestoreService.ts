import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, auth } from '../config/firebase';
import { Habit, Entry } from '../types';
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from './localStorageService';

// Collection names
const COLLECTIONS = {
  HABITS: 'habits',
  ENTRIES: 'entries',
  SETTINGS: 'settings',
} as const;

/**
 * Get the current user ID
 * Returns authenticated user's UID or 'default-user' as fallback
 */
function getUserId(): string {
  return auth?.currentUser?.uid || 'default-user';
}

/**
 * Strip undefined values from an object before sending to Firestore.
 * Firestore does NOT accept undefined values and will throw:
 * "Unsupported field value: undefined"
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      sanitized[key] = sanitizeForFirestore(value);
    }
  }
  return sanitized as T;
}

/**
 * Generic function to get all documents from a collection
 */
async function getAllDocuments<T>(
  collectionName: string,
  fallbackKey: string,
  fallbackDefault: T[]
): Promise<T[]> {
  // Fallback to localStorage if Firebase not configured
  if (!isFirebaseConfigured() || !db) {
    return getStorageItem<T[]>(fallbackKey, fallbackDefault);
  }

  try {
    const collectionRef = collection(db, `users/${getUserId()}/${collectionName}`);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as T));
  } catch (error) {
    console.error(`Error loading ${collectionName} from Firestore:`, error);
    // Fallback to localStorage on error
    return getStorageItem<T[]>(fallbackKey, fallbackDefault);
  }
}

/**
 * Generic function to save all documents to a collection
 */
async function saveAllDocuments<T extends { id: string }>(
  collectionName: string,
  documents: T[],
  fallbackKey: string
): Promise<boolean> {
  // Fallback to localStorage if Firebase not configured
  if (!isFirebaseConfigured() || !db) {
    return setStorageItem(fallbackKey, documents);
  }

  try {
    const batch = writeBatch(db);
    const collectionPath = `users/${getUserId()}/${collectionName}`;

    documents.forEach((document) => {
      const docRef = doc(db!, collectionPath, document.id);
      batch.set(docRef, sanitizeForFirestore(document));
    });

    await batch.commit();

    // Also save to localStorage as backup
    setStorageItem(fallbackKey, documents);

    return true;
  } catch (error) {
    console.error(`Error saving ${collectionName} to Firestore:`, error);
    // Fallback to localStorage on error
    return setStorageItem(fallbackKey, documents);
  }
}

/**
 * Generic function to add a single document
 */
async function addDocument<T extends { id: string }>(
  collectionName: string,
  document: T,
  fallbackKey: string
): Promise<boolean> {
  // Fallback to localStorage if Firebase not configured
  if (!isFirebaseConfigured() || !db) {
    const existing = getStorageItem<T[]>(fallbackKey, []);
    existing.push(document);
    return setStorageItem(fallbackKey, existing);
  }

  try {
    const docRef = doc(db, `users/${getUserId()}/${collectionName}`, document.id);
    await setDoc(docRef, sanitizeForFirestore(document));

    // Also update localStorage as backup
    const existing = getStorageItem<T[]>(fallbackKey, []);
    existing.push(document);
    setStorageItem(fallbackKey, existing);

    return true;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    // Fallback to localStorage on error
    const existing = getStorageItem<T[]>(fallbackKey, []);
    existing.push(document);
    return setStorageItem(fallbackKey, existing);
  }
}

/**
 * Generic function to delete a document
 */
async function deleteDocument<T extends { id: string }>(
  collectionName: string,
  documentId: string,
  fallbackKey: string
): Promise<boolean> {
  // Fallback to localStorage if Firebase not configured
  if (!isFirebaseConfigured() || !db) {
    const existing = getStorageItem<T[]>(fallbackKey, []);
    const filtered = existing.filter((item) => item.id !== documentId);
    return setStorageItem(fallbackKey, filtered);
  }

  try {
    const docRef = doc(db, `users/${getUserId()}/${collectionName}`, documentId);
    await deleteDoc(docRef);

    // Also update localStorage as backup
    const existing = getStorageItem<T[]>(fallbackKey, []);
    const filtered = existing.filter((item) => item.id !== documentId);
    setStorageItem(fallbackKey, filtered);

    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    // Fallback to localStorage on error
    const existing = getStorageItem<T[]>(fallbackKey, []);
    const filtered = existing.filter((item) => item.id !== documentId);
    return setStorageItem(fallbackKey, filtered);
  }
}

// ============= HABIT OPERATIONS =============

export async function loadHabits(): Promise<Habit[]> {
  const habits = await getAllDocuments<Habit>(COLLECTIONS.HABITS, STORAGE_KEYS.HABITS, []);
  const valid: Habit[] = [];
  for (const h of habits) {
    if (h.name && h.category) {
      valid.push(h);
    } else {
      console.warn(`⚠️ Corrupt habit document detected (id: ${h.id}), missing name or category:`, h);
    }
  }
  return valid;
}

export async function saveHabits(habits: Habit[]): Promise<boolean> {
  return saveAllDocuments(COLLECTIONS.HABITS, habits, STORAGE_KEYS.HABITS);
}

export async function addHabit(habit: Habit): Promise<boolean> {
  return addDocument(COLLECTIONS.HABITS, habit, STORAGE_KEYS.HABITS);
}

export async function deleteHabit(habitId: string): Promise<boolean> {
  return deleteDocument<Habit>(COLLECTIONS.HABITS, habitId, STORAGE_KEYS.HABITS);
}

export async function updateHabit(habit: Habit): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) {
    const habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
    const index = habits.findIndex((h) => h.id === habit.id);
    if (index !== -1) {
      habits[index] = habit;
      return setStorageItem(STORAGE_KEYS.HABITS, habits);
    }
    return false;
  }

  try {
    const docRef = doc(db, `users/${getUserId()}/${COLLECTIONS.HABITS}`, habit.id);
    await setDoc(docRef, sanitizeForFirestore(habit), { merge: true });

    // Also update localStorage
    const habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
    const index = habits.findIndex((h) => h.id === habit.id);
    if (index !== -1) {
      habits[index] = habit;
      setStorageItem(STORAGE_KEYS.HABITS, habits);
    }

    return true;
  } catch (error) {
    console.error('Error updating habit:', error);
    return false;
  }
}

export async function updateHabitFields(habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) {
    const habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
    const index = habits.findIndex((h) => h.id === habitId);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      return setStorageItem(STORAGE_KEYS.HABITS, habits);
    }
    return false;
  }

  try {
    const docRef = doc(db, `users/${getUserId()}/${COLLECTIONS.HABITS}`, habitId);
    await updateDoc(docRef, sanitizeForFirestore(updates));

    // Also update localStorage
    const habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
    const index = habits.findIndex((h) => h.id === habitId);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      setStorageItem(STORAGE_KEYS.HABITS, habits);
    }

    return true;
  } catch (error) {
    console.error('Error updating habit fields:', error);
    return false;
  }
}

// ============= ENTRY OPERATIONS =============

export async function loadEntries(): Promise<Entry[]> {
  return getAllDocuments<Entry>(COLLECTIONS.ENTRIES, STORAGE_KEYS.ENTRIES, []);
}

export async function saveEntries(entries: Entry[]): Promise<boolean> {
  return saveAllDocuments(COLLECTIONS.ENTRIES, entries, STORAGE_KEYS.ENTRIES);
}

export async function addEntry(entry: Entry): Promise<boolean> {
  return addDocument(COLLECTIONS.ENTRIES, entry, STORAGE_KEYS.ENTRIES);
}

export async function updateEntry(entry: Entry): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) {
    const entries = getStorageItem<Entry[]>(STORAGE_KEYS.ENTRIES, []);
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      entries[index] = entry;
      return setStorageItem(STORAGE_KEYS.ENTRIES, entries);
    }
    return false;
  }

  try {
    const docRef = doc(db, `users/${getUserId()}/${COLLECTIONS.ENTRIES}`, entry.id);
    await setDoc(docRef, entry, { merge: true });

    // Also update localStorage
    const entries = getStorageItem<Entry[]>(STORAGE_KEYS.ENTRIES, []);
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      entries[index] = entry;
      setStorageItem(STORAGE_KEYS.ENTRIES, entries);
    }

    return true;
  } catch (error) {
    console.error('Error updating entry:', error);
    return false;
  }
}

export async function deleteEntry(entryId: string): Promise<boolean> {
  return deleteDocument<Entry>(COLLECTIONS.ENTRIES, entryId, STORAGE_KEYS.ENTRIES);
}

// ============= MIGRATION HELPERS =============

/**
 * Migrate data from localStorage to Firestore
 * This should be called once when user first configures Firebase
 */
export async function migrateLocalStorageToFirestore(): Promise<{
  success: boolean;
  message: string;
}> {
  if (!isFirebaseConfigured() || !db) {
    return {
      success: false,
      message: 'Firebase not configured',
    };
  }

  try {
    // Load data from localStorage
    const localHabits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
    const localEntries = getStorageItem<Entry[]>(STORAGE_KEYS.ENTRIES, []);

    // Check if there's any data to migrate
    if (localHabits.length === 0 && localEntries.length === 0) {
      return {
        success: true,
        message: 'No data to migrate',
      };
    }

    // Save to Firestore
    await saveHabits(localHabits);
    await saveEntries(localEntries);

    return {
      success: true,
      message: `Migrated ${localHabits.length} habits and ${localEntries.length} entries`,
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return {
      success: false,
      message: `Migration failed: ${error}`,
    };
  }
}

/**
 * Subscribe to real-time updates for habits
 */
export function subscribeToHabits(
  callback: (habits: Habit[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }

  try {
    const collectionRef = collection(db, `users/${getUserId()}/${COLLECTIONS.HABITS}`);
    return onSnapshot(collectionRef, (snapshot) => {
      const habits = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Habit));
      callback(habits);
      // Also update localStorage
      setStorageItem(STORAGE_KEYS.HABITS, habits);
    });
  } catch (error) {
    console.error('Error subscribing to habits:', error);
    return null;
  }
}

/**
 * Subscribe to real-time updates for entries
 */
export function subscribeToEntries(
  callback: (entries: Entry[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }

  try {
    const collectionRef = collection(db, `users/${getUserId()}/${COLLECTIONS.ENTRIES}`);
    return onSnapshot(collectionRef, (snapshot) => {
      const entries = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Entry));
      callback(entries);
      // Also update localStorage
      setStorageItem(STORAGE_KEYS.ENTRIES, entries);
    });
  } catch (error) {
    console.error('Error subscribing to entries:', error);
    return null;
  }
}

/**
 * Clear all data (habits and entries)
 * WARNING: This will permanently delete all data!
 */
export async function clearAllData(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (isFirebaseConfigured() && db) {
      // Clear Firestore data
      const userId = getUserId();
      const batch = writeBatch(db);

      // Delete all habits
      const habitsRef = collection(db, `users/${userId}/${COLLECTIONS.HABITS}`);
      const habitsSnapshot = await getDocs(habitsRef);
      habitsSnapshot.docs.forEach((document) => {
        batch.delete(document.ref);
      });

      // Delete all entries
      const entriesRef = collection(db, `users/${userId}/${COLLECTIONS.ENTRIES}`);
      const entriesSnapshot = await getDocs(entriesRef);
      entriesSnapshot.docs.forEach((document) => {
        batch.delete(document.ref);
      });

      await batch.commit();
    }

    // Clear localStorage
    setStorageItem(STORAGE_KEYS.HABITS, []);
    setStorageItem(STORAGE_KEYS.ENTRIES, []);

    return {
      success: true,
      message: 'Todos los datos han sido eliminados correctamente',
    };
  } catch (error) {
    console.error('Error clearing data:', error);
    return {
      success: false,
      message: `Error al eliminar datos: ${error}`,
    };
  }
}
