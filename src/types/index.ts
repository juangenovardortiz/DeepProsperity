// Core enums
export enum Category {
  Cuerpo = 'Cuerpo',
  Energia = 'Energia',
  Mente = 'Mente',
  Trabajo = 'Trabajo',
  Relaciones = 'Relaciones',
  Dinero = 'Dinero'
}

export enum UnitType {
  none = 'none',
  min = 'min',
  count = 'count'
}

export enum Periodicity {
  once = 'once',
  daily = 'daily'
}

// Core interfaces
export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: Category;
  xp: number;
  unitType?: UnitType;
  minThreshold?: number;
  tags?: string[];
  isPinned?: boolean;
  periodicity?: Periodicity;
  daysOfWeek?: number[];
  targetDate?: string; // YYYY-MM-DD — for once-tasks, the day they belong to
  order?: number;
  isBeforeSleep?: boolean;
  createdAt: number;
}

export interface Entry {
  id: string;
  habitId: string;
  dateISO: string; // YYYY-MM-DD
  timestamp: number;
  unitValue?: number;
  xpBase: number;
  xpEffective: number;
  categorySnapshot: Category;
}

export interface RadarData {
  percentages: Record<Category, number>;
  balanceScore: number;
}

export interface TodayStats {
  radarData: RadarData;
  entryCount: number;
  totalCount: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  activeDays: string[];
}
