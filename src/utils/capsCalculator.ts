import { Entry, Category } from '../types';
import { CATEGORIES_ORDER } from '../types/constants';

/**
 * Get count of entries for a specific category today
 */
export function getCategoryCount(entriesToday: Entry[], category: Category): number {
  return entriesToday.filter(entry => entry.categorySnapshot === category).length;
}

/**
 * Get total entry count per category
 */
export function getCategoryCounts(entriesToday: Entry[]): Record<Category, number> {
  const counts = Object.fromEntries(
    CATEGORIES_ORDER.map(cat => [cat, 0])
  ) as Record<Category, number>;

  entriesToday.forEach(entry => {
    counts[entry.categorySnapshot]++;
  });

  return counts;
}
