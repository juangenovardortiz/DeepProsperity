import { Category, Habit } from './index';

export const BALANCE_SCORE_FACTOR = 1.5;

export const CATEGORIES_ORDER: Category[] = [
  Category.Cuerpo,
  Category.Energia,
  Category.Trabajo,
  Category.Dinero,
  Category.Relaciones,
  Category.Mente,
];

export const CATEGORY_CONFIG: Record<Category, { label: string; color: string; icon: string }> = {
  [Category.Cuerpo]: { label: 'Cuerpo', color: '#27ae60', icon: '💪' },
  [Category.Energia]: { label: 'Energía', color: '#7bed9f', icon: '⚡' },
  [Category.Mente]: { label: 'Mente', color: '#9b59b6', icon: '🧠' },
  [Category.Trabajo]: { label: 'Trabajo', color: '#3498db', icon: '💼' },
  [Category.Relaciones]: { label: 'Relaciones', color: '#ff7675', icon: '❤️' },
  [Category.Dinero]: { label: 'Dinero', color: '#2c3e50', icon: '💰' },
};

export const DEFAULT_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [];
