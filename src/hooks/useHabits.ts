import { useState, useEffect, useCallback } from 'react';
import { Habit, Category } from '../types';
import {
  initializeHabits,
  loadHabits,
  addHabit as addHabitService,
  updateHabit as updateHabitService,
  deleteHabit as deleteHabitService,
  toggleHabitPin as toggleHabitPinService
} from '../services/habitService';
import { updateHabit as upsertHabitFirestore } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

export function useHabits() {
  const { user, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load habits only after auth resolves and user is authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const loadData = async () => {
      setIsLoading(true);
      const loadedHabits = await initializeHabits();
      if (!cancelled) {
        setHabits(loadedHabits);
        setIsLoading(false);
      }
    };
    loadData();

    return () => { cancelled = true; };
  }, [user?.uid, authLoading]);

  // Add a new habit (new items appear first in the list)
  const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (habitData.order === undefined) {
      const minOrder = Math.min(0, ...habits.map(h => h.order ?? 0));
      habitData = { ...habitData, order: minOrder - 1 };
    }
    const newHabit = await addHabitService(habitData);
    setHabits(prevHabits => [...prevHabits, newHabit]);
    return newHabit;
  }, [habits]);

  // Update an existing habit
  const updateHabit = useCallback(async (habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    // Optimistic update: update local state immediately
    setHabits(prevHabits =>
      prevHabits.map(h =>
        h.id === habitId ? { ...h, ...updates } : h
      )
    );

    // Then persist to backend
    let success = await updateHabitService(habitId, updates);

    // If update failed (e.g. document doesn't exist in Firestore yet),
    // try to save the full habit to Firestore as an upsert
    if (!success) {
      console.warn(`⚠️ updateHabit failed for ${habitId}, attempting to save full habit to Firestore...`);
      const currentHabit = habits.find(h => h.id === habitId);
      if (currentHabit) {
        const fullHabit = { ...currentHabit, ...updates };
        success = await upsertHabitFirestore(fullHabit);
        if (success) {
          console.log(`✅ Full habit saved to Firestore for ${habitId}`);
          return true;
        }
      }
      // Last resort: reload from Firestore
      console.error(`❌ Failed to save habit ${habitId}, reloading from Firestore...`);
      const updatedHabits = await loadHabits();
      setHabits(updatedHabits);
    }

    return success;
  }, [habits]);

  // Delete a habit
  const deleteHabit = useCallback(async (habitId: string) => {
    const success = await deleteHabitService(habitId);
    if (success) {
      setHabits(prevHabits => prevHabits.filter(h => h.id !== habitId));
    }
    return success;
  }, []);

  // Get habit by ID
  const getHabitById = useCallback((habitId: string) => {
    return habits.find(h => h.id === habitId);
  }, [habits]);

  // Get habits by category
  const getHabitsByCategory = useCallback((category: Category) => {
    return habits.filter(h => h.category === category);
  }, [habits]);

  // Toggle pin status of a habit
  const togglePin = useCallback(async (habitId: string) => {
    // Optimistic update: toggle pin status immediately in local state
    setHabits(prevHabits =>
      prevHabits.map(h =>
        h.id === habitId ? { ...h, isPinned: !h.isPinned } : h
      )
    );

    // Then persist to backend
    const success = await toggleHabitPinService(habitId);

    // If the update failed, reload habits to revert to the correct state
    if (!success) {
      const updatedHabits = await loadHabits();
      setHabits(updatedHabits);
    }

    return success;
  }, []);

  return {
    habits,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    togglePin,
    getHabitById,
    getHabitsByCategory
  };
}
