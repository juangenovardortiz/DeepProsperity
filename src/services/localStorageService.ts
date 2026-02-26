/**
 * localStorage service with error handling and type safety
 */

const STORAGE_KEYS = {
  HABITS: 'habitApp_habits',
  ENTRIES: 'habitApp_entries',
  STREAK: 'habitApp_streak',
  SETTINGS: 'habitApp_settings',
  VERSION: 'habitApp_version',
} as const;

export { STORAGE_KEYS };

/**
 * Get item from localStorage with JSON parsing
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage with JSON stringification
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider clearing old data.');
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorage(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
