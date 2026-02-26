import { useMemo } from 'react';
import { Entry, Habit, TodayStats } from '../types';
import { computeRadarData } from '../utils/radarCalculator';

export function useTodayStats(todayEntries: Entry[], habits: Habit[]): TodayStats {
  return useMemo(() => ({
    radarData: computeRadarData(todayEntries, habits),
    entryCount: todayEntries.length,
    totalCount: habits.filter(h => h.isPinned).length
  }), [todayEntries, habits]);
}
