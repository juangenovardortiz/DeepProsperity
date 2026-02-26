import { Category, Habit, Periodicity } from '../types';

/**
 * Default habits that are created for new users
 */
export interface DefaultHabitData {
  name: string;
  description: string;
  category: Category;
  xp: number;
  periodicity: Periodicity;
  daysOfWeek: number[];
}

export const DEFAULT_HABITS: DefaultHabitData[] = [
  // 1. Energía - Prepara el Descanso
  {
    name: 'Prepara el Descanso',
    description: 'Evita pantallas al menos 30 minutos antes de dormir.',
    category: Category.Energia,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 2. Energía - Duerme entre 6-8h
  {
    name: 'Duerme entre 6-8h',
    description: 'Recupera tu cuerpo y mente lo suficiente.',
    category: Category.Energia,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 3. Mente - Plan del Día
  {
    name: 'Plan del Día',
    description: 'Crea en esta aplicación las tareas imprescindibles para hoy.',
    category: Category.Mente,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 4. Mente - Visualización de Éxito
  {
    name: 'Visualización de Éxito',
    description: 'Cierra los ojos e imagina con claridad que has logrado tu objetivo.',
    category: Category.Mente,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 5. Mente - Ritual de Gratitud
  {
    name: 'Ritual de Gratitud (3 cosas)',
    description: 'Agradece conscientemente tres cosas de tu día.',
    category: Category.Mente,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 6. Trabajo - Mejora de Habilidad Clave
  {
    name: 'Mejora de Habilidad Clave',
    description: 'Aprende algo útil que aumente tu valor personal o profesional.',
    category: Category.Trabajo,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 7. Trabajo - Paso Estratégico
  {
    name: 'Paso Estratégico',
    description: 'Haz una acción concreta que te acerque a tu objetivo principal.',
    category: Category.Trabajo,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 8. Dinero - Control de Finanzas
  {
    name: 'Control de Finanzas',
    description: 'Revisa tus ingresos y gastos para mantener el control.',
    category: Category.Dinero,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 9. Dinero - Capricho
  {
    name: 'Capricho',
    description: 'Evita una compra impulsiva que no necesitas.',
    category: Category.Dinero,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 10. Dinero - Micro-Lección Financiera
  {
    name: 'Micro-Lección Financiera',
    description: 'Aprende algo nuevo sobre ahorro, inversión o gestión del dinero.',
    category: Category.Dinero,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 11. Relaciones - Conexión Real
  {
    name: 'Conexión Real',
    description: 'Habla o comparte un momento significativo con alguien.',
    category: Category.Relaciones,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 12. Relaciones - Acto de Servicio
  {
    name: 'Acto de Servicio',
    description: 'Ayuda a alguien sin esperar nada a cambio.',
    category: Category.Relaciones,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 13. Relaciones - Tiempo de Calidad
  {
    name: 'Tiempo de Calidad',
    description: 'Dedica atención plena a las personas importantes para ti.',
    category: Category.Relaciones,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 14. Mente - Día sin Quejas
  {
    name: 'Día sin Quejas',
    description: 'No te has quejado ni resoplado.',
    category: Category.Mente,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 15. Mente - Intención Pura
  {
    name: 'Intención Pura',
    description: 'No se las deseado mal a nadie.',
    category: Category.Mente,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 16. Mente - Lectura
  {
    name: 'Lectura (15\')',
    description: 'Lee al menos 15 minutos un libro.',
    category: Category.Mente,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 17. Cuerpo - Movimiento Diario
  {
    name: 'Movimiento Diario (20 min)',
    description: 'Realiza al menos 20 minutos de actividad física, aunque sea caminar.',
    category: Category.Cuerpo,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 18. Cuerpo - Duchate
  {
    name: 'Duchate',
    description: 'Lávate el cuerpo completo.',
    category: Category.Cuerpo,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 19. Cuerpo - Dientes
  {
    name: 'Dientes',
    description: 'Lavate los dientes.',
    category: Category.Cuerpo,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 20. Cuerpo - Pulmones Limpios
  {
    name: 'Pulmones Limpios',
    description: 'No fumes durante todo el día.',
    category: Category.Cuerpo,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // 21. Cuerpo - 0 Alcohol
  {
    name: '0 Alcohol',
    description: 'No consumas alcohol para mantener tu cuerpo limpio y enfocado.',
    category: Category.Cuerpo,
    xp: 0,
    periodicity: Periodicity.daily,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },
];

/**
 * Converts default habit data to full Habit objects
 */
export function createDefaultHabits(): Habit[] {
  return DEFAULT_HABITS.map((data, index) => ({
    id: `default-habit-${index}-${Date.now()}`,
    name: data.name,
    description: data.description,
    category: data.category,
    xp: data.xp,
    periodicity: data.periodicity,
    daysOfWeek: data.daysOfWeek,
    isPinned: true,
    createdAt: Date.now(),
    order: index,
  }));
}
