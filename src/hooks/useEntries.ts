import { useState, useEffect, useCallback } from 'react';
import { Entry, Habit, Periodicity } from '../types';
import {
  loadEntries,
  addEntry as addEntryService,
  updateEntry as updateEntryService,
  deleteEntry as deleteEntryService
} from '../services/entryService';
import { createEntry } from '../utils/entryManager';
import { getTodayISO } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

export function useEntries() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries only after auth resolves and user is authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const loadData = async () => {
      setIsLoading(true);
      const loadedEntries = await loadEntries();
      if (!cancelled) {
        setEntries(loadedEntries);
        setIsLoading(false);
      }
    };
    loadData();

    return () => { cancelled = true; };
  }, [user?.uid, authLoading]);

  // Find existing entry for a habit based on its periodicity and optional target date
  const findPeriodEntry = useCallback((habit: Habit, targetDateISO?: string): Entry | undefined => {
    const periodicity = habit.periodicity || Periodicity.daily;
    const habitEntries = entries.filter(e => e.habitId === habit.id);

    // If a specific date is provided, look for entry on that date
    if (targetDateISO) {
      return habitEntries.find(e => e.dateISO === targetDateISO);
    }

    // Otherwise, use current period logic
    switch (periodicity) {
      case Periodicity.once:
        return habitEntries[0];
      case Periodicity.daily:
      default:
        return habitEntries.find(e => e.dateISO === getTodayISO());
    }
  }, [entries]);

  // Toggle a habit entry (add if missing, remove if exists within its period)
  // targetDateISO: optional date to toggle entry for (defaults to today)
  // For once-tasks: completion is one-way — once completed, the entry is NOT deleted.
  const toggleEntry = useCallback(async (habit: Habit, targetDateISO?: string): Promise<{ success: boolean; added: boolean }> => {
    const dateISO = targetDateISO || getTodayISO();
    const existingEntry = findPeriodEntry(habit, dateISO);

    if (existingEntry) {
      const success = await deleteEntryService(existingEntry.id);
      if (success) {
        setEntries(prev => prev.filter(e => e.id !== existingEntry.id));
      }
      return { success, added: false };
    }

    const entry = createEntry(habit, undefined, dateISO);
    const success = await addEntryService(entry);
    if (success) {
      setEntries(prev => [...prev, entry]);
    }
    return { success, added: true };
  }, [entries, findPeriodEntry]);

  // Update an entry
  const updateEntry = useCallback(async (updatedEntry: Entry) => {
    const success = await updateEntryService(updatedEntry);
    if (success) {
      setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    }
    return success;
  }, []);

  // Delete an entry
  const deleteEntry = useCallback(async (entryId: string) => {
    const success = await deleteEntryService(entryId);
    if (success) {
      setEntries(prevEntries => prevEntries.filter(e => e.id !== entryId));
    }
    return success;
  }, []);

  // Get today's entries
  const getTodayEntries = useCallback(() => {
    return entries.filter(e => e.dateISO === getTodayISO());
  }, [entries]);

  // Get entries by date
  const getEntriesForDate = useCallback((dateISO: string) => {
    return entries.filter(e => e.dateISO === dateISO);
  }, [entries]);

  // Get entries by habit
  const getEntriesByHabit = useCallback((habitId: string) => {
    return entries.filter(e => e.habitId === habitId);
  }, [entries]);

  return {
    entries,
    isLoading,
    toggleEntry,
    updateEntry,
    deleteEntry,
    getTodayEntries,
    getEntriesForDate,
    getEntriesByHabit
  };
}
