/**
 * Convert Date to ISO string (YYYY-MM-DD)
 */
/**
 * Convert Date to ISO string (YYYY-MM-DD)
 */
export function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert timestamp (ms) to ISO string (YYYY-MM-DD)
 */
export function timestampToISO(timestamp: number): string {
  return toISO(new Date(timestamp));
}

/**
 * Get today's date in ISO format (YYYY-MM-DD) using local timezone
 */
export function getTodayISO(): string {
  return toISO(new Date());
}

/**
 * Format date for display
 */
export function formatDate(dateISO: string): string {
  const date = new Date(dateISO + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Check if a dateISO matches today
 */
export function isToday(dateISO: string): boolean {
  return dateISO === getTodayISO();
}

/**
 * Parse ISO date string to Date object
 */
export function parseISO(dateISO: string): Date {
  return new Date(dateISO + 'T00:00:00');
}

/**
 * Get date N days ago in ISO format
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISO(date);
}

/**
 * Get today's day of week (JS convention: 0=Sun, 1=Mon, ..., 6=Sat)
 */
export function getTodayDayOfWeek(): number {
  return new Date().getDay();
}

/**
 * Get a date ISO with day offset from today
 */
export function getDateWithOffset(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return toISO(date);
}

/**
 * Get the day of week for a date with offset from today
 */
export function getDayOfWeekWithOffset(daysOffset: number): number {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.getDay();
}

/**
 * Calculate the day offset from today for a given ISO date
 */
export function getOffsetFromDateISO(dateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateISO + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date ISO string and return the new date ISO
 */
export function addDaysToDateISO(dateISO: string, days: number): string {
  const date = new Date(dateISO + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return toISO(date);
}

/**
 * Get day of week for a date ISO string
 */
export function getDayOfWeekFromDateISO(dateISO: string): number {
  return new Date(dateISO + 'T00:00:00').getDay();
}

/**
 * Format label for a date relative to today
 */
export function formatDateLabel(dateISO: string): string {
  const offset = getOffsetFromDateISO(dateISO);
  if (offset === 0) return 'Hoy';
  if (offset === -1) return 'Ayer';
  if (offset === 1) return 'Mañana';
  const date = new Date(dateISO + 'T00:00:00');
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format label for daily navigation
 */
export function formatDayLabel(daysOffset: number): string {
  if (daysOffset === 0) return 'Hoy';
  if (daysOffset === -1) return 'Ayer';
  if (daysOffset === 1) return 'Mañana';
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
