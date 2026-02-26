import { Entry, Habit, Category, RadarData } from '../types';
import { CATEGORIES_ORDER } from '../types/constants';

/**
 * Count pinned habits per category
 */
function getPinnedCountsPerCategory(habits: Habit[]): Record<Category, number> {
  const counts = Object.fromEntries(
    CATEGORIES_ORDER.map(cat => [cat, 0])
  ) as Record<Category, number>;

  habits.forEach(h => {
    if (h.isPinned) counts[h.category]++;
  });

  return counts;
}

/**
 * Compute radar percentages for each category (0-100)
 * Based on completed tasks relative to pinned tasks per category
 */
export function computeRadarPercentages(entriesToday: Entry[], habits: Habit[]): Record<Category, number> {
  const pinnedCounts = getPinnedCountsPerCategory(habits);
  const percentages = Object.fromEntries(
    CATEGORIES_ORDER.map(cat => [cat, 0])
  ) as Record<Category, number>;

  CATEGORIES_ORDER.forEach(category => {
    const completedCount = entriesToday.filter(e => e.categorySnapshot === category).length;
    const totalTasks = pinnedCounts[category];

    if (totalTasks === 0) {
      percentages[category] = completedCount > 0 ? 100 : 0;
    } else {
      percentages[category] = Math.min(100, (completedCount / totalTasks) * 100);
    }
  });

  return percentages;
}

/**
 * Compute prosperity score (0-100) based on completion rate and balance
 *
 * Formula:
 * - 80% weight on overall completion rate (how many tasks you completed)
 * - 20% bonus for balance (how evenly distributed across categories)
 *
 * This rewards progress while still encouraging balanced development
 */
export function computeBalanceScore(percentages: Record<Category, number>): number {
  const values = CATEGORIES_ORDER.map(cat => percentages[cat]);

  // If no entries (all zeros), return 0
  const total = values.reduce((sum, val) => sum + val, 0);
  if (total === 0) {
    return 0;
  }

  // Calculate mean completion rate across all categories
  const mean = total / values.length;

  // COMPLETION COMPONENT (80% weight)
  // Simply the average completion percentage across categories
  const completionScore = mean;

  // BALANCE COMPONENT (20% weight)
  // Calculate how balanced the categories are (0 = perfectly balanced, high = imbalanced)
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stddev = Math.sqrt(variance);

  // Convert stddev to a 0-100 balance score (lower stddev = higher balance)
  // Max expected stddev is ~40 (all tasks in one category), so normalize by that
  const maxStdDev = 40;
  const balanceScore = Math.max(0, 100 - (stddev / maxStdDev) * 100);

  // COMBINED PROSPERITY SCORE
  // 80% completion + 20% balance bonus
  const prosperityScore = (completionScore * 0.8) + (balanceScore * 0.2);

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, prosperityScore));
}

/**
 * Compute complete radar data (percentages + balance score)
 */
export function computeRadarData(entriesToday: Entry[], habits: Habit[]): RadarData {
  // If no habits exist at all, return all zeros
  if (habits.length === 0) {
    const zeroPercentages = Object.fromEntries(
      CATEGORIES_ORDER.map(cat => [cat, 0])
    ) as Record<Category, number>;

    return {
      percentages: zeroPercentages,
      balanceScore: 0
    };
  }

  // If no pinned habits, return all zeros
  const pinnedHabits = habits.filter(h => h.isPinned);
  if (pinnedHabits.length === 0) {
    const zeroPercentages = Object.fromEntries(
      CATEGORIES_ORDER.map(cat => [cat, 0])
    ) as Record<Category, number>;

    return {
      percentages: zeroPercentages,
      balanceScore: 0
    };
  }

  const percentages = computeRadarPercentages(entriesToday, habits);
  const balanceScore = computeBalanceScore(percentages);

  return {
    percentages,
    balanceScore
  };
}
