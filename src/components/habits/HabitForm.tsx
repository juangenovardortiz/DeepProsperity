import { useState, useEffect } from 'react';
import { Category, Habit, Periodicity } from '../../types';
import { CATEGORIES_ORDER, CATEGORY_CONFIG } from '../../types/constants';

const DAY_LABELS: { day: number; label: string }[] = [
  { day: 1, label: 'L' },
  { day: 2, label: 'M' },
  { day: 3, label: 'X' },
  { day: 4, label: 'J' },
  { day: 5, label: 'V' },
  { day: 6, label: 'S' },
  { day: 0, label: 'D' },
];

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

interface HabitFormProps {
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Habit>;
}

export function HabitForm({ onSave, onCancel, initialData }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.Cuerpo);
  const [isTask, setIsTask] = useState(initialData?.periodicity === Periodicity.once);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialData?.daysOfWeek || ALL_DAYS);
  const [isBeforeSleep, setIsBeforeSleep] = useState(initialData?.isBeforeSleep || false);
  const [error, setError] = useState('');

  // Sync state when initialData changes (important for edit mode)
  useEffect(() => {
    setName(initialData?.name || '');
    setDescription(initialData?.description || '');
    setCategory(initialData?.category || Category.Cuerpo);
    setIsTask(initialData?.periodicity === Periodicity.once);
    setDaysOfWeek(initialData?.daysOfWeek || ALL_DAYS);
    setIsBeforeSleep(initialData?.isBeforeSleep || false);
    setError('');
  }, [initialData]);

  const handleToggleDayOfWeek = (day: number) => {
    setDaysOfWeek(prev => {
      if (prev.includes(day)) {
        if (prev.length <= 1) return prev;
        return prev.filter(d => d !== day);
      }
      return [...prev, day];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor ingresa un nombre para la tarea');
      return;
    }

    const finalPeriodicity = isTask ? Periodicity.once : Periodicity.daily;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      xp: 0,
      periodicity: finalPeriodicity,
      isBeforeSleep,
      ...(!isTask ? { daysOfWeek } : {})
    });
  };

  return (
    <form onSubmit={handleSubmit} className="habit-form" noValidate>
      <div className="form-group">
        <label htmlFor="habit-name">Nombre *</label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="Ej: Meditar 10 minutos"
          className={`form-input ${error ? 'form-input-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? 'habit-name-error' : undefined}
        />
        {error && (
          <p id="habit-name-error" className="form-error" role="alert">{error}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="habit-description">Descripción</label>
        <textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descripción de la tarea o hábito"
          className="form-input"
          rows={2}
        />
      </div>

      <div className="form-group">
        <label id="habit-category-label">Categoría *</label>
        <div className="category-grid" role="radiogroup" aria-labelledby="habit-category-label">
          {CATEGORIES_ORDER.map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`category-option ${isSelected ? 'selected' : ''}`}
                onClick={() => setCategory(cat)}
                data-category={cat}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label>Tipo</label>
        <div className="periodicity-selector">
          <button
            type="button"
            className={`periodicity-btn ${isTask ? 'active' : ''}`}
            onClick={() => setIsTask(true)}
          >
            Tarea
          </button>
          <button
            type="button"
            className={`periodicity-btn ${!isTask ? 'active' : ''}`}
            onClick={() => setIsTask(false)}
          >
            Hábito
          </button>
        </div>

        {!isTask && (
          <>
            <label>Días de la semana</label>
            <div className="day-selector">
              {DAY_LABELS.map(({ day, label }) => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${daysOfWeek.includes(day) ? 'active' : ''}`}
                  onClick={() => handleToggleDayOfWeek(day)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="form-group">
        <div className="before-sleep-toggle">
          <label className="before-sleep-label">
            <input
              type="checkbox"
              checked={isBeforeSleep}
              onChange={(e) => {
                setIsBeforeSleep(e.target.checked);
                if (e.target.checked) setIsTask(false);
              }}
            />
            <span>Antes de dormir 🌙</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}
