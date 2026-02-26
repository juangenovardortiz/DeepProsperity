import { Entry, StreakInfo } from '../types';
import { getTodayISO, getDaysAgo } from './dateUtils';

/**
 * Calculate level = unique days where the user completed at least one task
 * on the actual day (not backdated). Compares entry.dateISO with the local
 * date derived from entry.timestamp.
 */
export function calculateLevel(entries: Entry[]): number {
  const sameDayDates = new Set<string>();
  for (const entry of entries) {
    const d = new Date(entry.timestamp);
    const createdISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (createdISO === entry.dateISO) {
      sameDayDates.add(entry.dateISO);
    }
  }
  return sameDayDates.size;
}

export function calculateStreak(entries: Entry[]): StreakInfo {
  const uniqueDates = new Set<string>();
  for (const entry of entries) {
    uniqueDates.add(entry.dateISO);
  }

  if (uniqueDates.size === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDays: [] };
  }

  const sortedDays = Array.from(uniqueDates).sort();

  // Current streak
  const today = getTodayISO();
  let currentStreak = 0;
  const startDay = uniqueDates.has(today) ? 0 : 1;

  if (startDay === 0 || uniqueDates.has(getDaysAgo(1))) {
    currentStreak = 1;
    for (let i = startDay + 1; i < 365; i++) {
      if (uniqueDates.has(getDaysAgo(i))) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak
  let maxStreak = 1;
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const curr = new Date(sortedDays[i] + 'T00:00:00');
    const prev = new Date(sortedDays[i - 1] + 'T00:00:00');
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      if (streak > maxStreak) maxStreak = streak;
    } else {
      streak = 1;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, maxStreak),
    activeDays: sortedDays
  };
}
