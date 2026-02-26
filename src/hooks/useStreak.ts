import { useMemo } from 'react';
import { Entry, StreakInfo } from '../types';
import { calculateStreak } from '../utils/streakCalculator';

/**
 * Custom hook to calculate streak information from entries
 */
export function useStreak(entries: Entry[]): StreakInfo {
  return useMemo(() => {
    return calculateStreak(entries);
  }, [entries]);
}
