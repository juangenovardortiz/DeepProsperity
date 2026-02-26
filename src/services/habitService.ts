import { Habit } from '../types';
import * as firestoreService from './firestoreService';
import { createDefaultHabits } from '../config/defaultHabits';

/**
 * Load habits from Firestore/localStorage
 */
export async function loadHabits(): Promise<Habit[]> {
  return firestoreService.loadHabits();
}

/**
 * Save habits to Firestore/localStorage
 */
export async function saveHabits(habits: Habit[]): Promise<boolean> {
  return firestoreService.saveHabits(habits);
}

/**
 * Initialize habits - returns existing habits or creates default habits for new users
 */
export async function initializeHabits(): Promise<Habit[]> {
  const existingHabits = await loadHabits();

  console.log('🔍 Initializing habits. Found:', existingHabits.length, 'existing habits');

  // If user already has habits, return them
  if (existingHabits.length > 0) {
    console.log('✅ Returning existing habits:', existingHabits);
    return existingHabits;
  }

  // For new users, create default habits
  console.log('🆕 Creating default habits for new user');
  const defaultHabits = createDefaultHabits();

  console.log('💾 Saving', defaultHabits.length, 'default habits');
  await saveHabits(defaultHabits);

  console.log('✅ Default habits saved successfully');
  return defaultHabits;
}

/**
 * Add a new habit
 */
export async function addHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
  const newHabit: Habit = {
    ...habit,
    id: generateHabitId(),
    createdAt: Date.now()
  };

  await firestoreService.addHabit(newHabit);

  return newHabit;
}

/**
 * Update an existing habit
 */
export async function updateHabit(habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): Promise<boolean> {
  return firestoreService.updateHabitFields(habitId, updates);
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<boolean> {
  return firestoreService.deleteHabit(habitId);
}

/**
 * Toggle pin status of a habit
 */
export async function toggleHabitPin(habitId: string): Promise<boolean> {
  const habits = await loadHabits();
  const index = habits.findIndex(h => h.id === habitId);

  if (index === -1) {
    return false;
  }

  const updatedHabit = {
    ...habits[index],
    isPinned: !habits[index].isPinned
  };

  return firestoreService.updateHabit(updatedHabit);
}

/**
 * Get habit by ID
 */
export async function getHabitById(habitId: string): Promise<Habit | undefined> {
  const habits = await loadHabits();
  return habits.find(h => h.id === habitId);
}

/**
 * Restore default habits - deletes all current habits and creates default ones
 */
export async function restoreDefaultHabits(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // First, get all existing habits
    const existingHabits = await loadHabits();

    // Delete all existing habits one by one
    for (const habit of existingHabits) {
      await deleteHabit(habit.id);
    }

    // Create default habits
    const defaultHabits = createDefaultHabits();

    // Add each default habit
    for (const habitData of defaultHabits) {
      await firestoreService.addHabit(habitData);
    }

    return {
      success: true,
      message: `${defaultHabits.length} hábitos predeterminados restaurados correctamente`,
    };
  } catch (error) {
    console.error('Error restoring default habits:', error);
    return {
      success: false,
      message: `Error al restaurar hábitos: ${error}`,
    };
  }
}

/**
 * Generate unique habit ID
 */
function generateHabitId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `habit-${crypto.randomUUID()}`;
  }
  return `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
