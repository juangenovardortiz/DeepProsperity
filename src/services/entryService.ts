import { Entry } from '../types';
import { getTodayISO } from '../utils/dateUtils';
import * as firestoreService from './firestoreService';

/**
 * Load all entries from Firestore/localStorage
 */
export async function loadEntries(): Promise<Entry[]> {
  return firestoreService.loadEntries();
}

/**
 * Save all entries to Firestore/localStorage
 */
export async function saveEntries(entries: Entry[]): Promise<boolean> {
  return firestoreService.saveEntries(entries);
}

/**
 * Add a new entry
 */
export async function addEntry(entry: Entry): Promise<boolean> {
  return firestoreService.addEntry(entry);
}

/**
 * Update an existing entry
 */
export async function updateEntry(entry: Entry): Promise<boolean> {
  return firestoreService.updateEntry(entry);
}

/**
 * Delete an entry by ID
 */
export async function deleteEntry(entryId: string): Promise<boolean> {
  return firestoreService.deleteEntry(entryId);
}

/**
 * Get entries for a specific date
 */
export async function getEntriesByDate(dateISO: string): Promise<Entry[]> {
  const entries = await loadEntries();
  return entries.filter(e => e.dateISO === dateISO);
}

/**
 * Get today's entries
 */
export async function getTodayEntries(): Promise<Entry[]> {
  return getEntriesByDate(getTodayISO());
}

/**
 * Get entries for a specific habit
 */
export async function getEntriesByHabit(habitId: string): Promise<Entry[]> {
  const entries = await loadEntries();
  return entries.filter(e => e.habitId === habitId);
}

/**
 * Get entries within a date range
 */
export async function getEntriesInRange(startDate: string, endDate: string): Promise<Entry[]> {
  const entries = await loadEntries();
  return entries.filter(e => e.dateISO >= startDate && e.dateISO <= endDate);
}

/**
 * Clear all entries (use with caution)
 */
export async function clearAllEntries(): Promise<boolean> {
  return saveEntries([]);
}
