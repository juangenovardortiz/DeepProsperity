import { Habit, Entry } from '../types';
import { getTodayISO } from './dateUtils';

/**
 * Create a new entry (does not persist it)
 */
export function createEntry(
  habit: Habit,
  unitValue?: number,
  dateISO?: string
): Entry {
  return {
    id: generateId(),
    habitId: habit.id,
    dateISO: dateISO || getTodayISO(),
    timestamp: Date.now(),
    ...(unitValue !== undefined && { unitValue }),
    xpBase: 0,
    xpEffective: 0,
    categorySnapshot: habit.category
  };
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
