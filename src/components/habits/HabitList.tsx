import { Habit } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';

interface HabitListProps {
  habits: Habit[];
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  className?: string;
}

export function HabitList({ habits, onEdit, onDelete, className }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className={`habit-list empty ${className || ''}`}>
        <p className="empty-message">
          No hay tareas personalizados todavía.
        </p>
      </div>
    );
  }

  return (
    <div className={`habit-list ${className || ''}`}>
      {habits.map(habit => (
        <div key={habit.id} className="habit-list-item">
          <div className="habit-list-item-content">
            <div className="habit-list-item-header">
              <span className="habit-list-item-name">{habit.name}</span>
              {habit.description && (
                <span className="habit-list-item-description">{habit.description}</span>
              )}
            </div>
            <div className="habit-list-item-details">
              <CategoryBadge category={habit.category} size="small" />
              {habit.unitType && habit.unitType !== 'none' && (
                <span className="habit-unit-type">
                  {habit.unitType === 'min' ? '⏱️ Minutos' : '🔢 Contador'}
                  {habit.minThreshold && ` (min: ${habit.minThreshold})`}
                </span>
              )}
            </div>
            {habit.tags && habit.tags.length > 0 && (
              <div className="habit-tags">
                {habit.tags.map((tag, idx) => (
                  <span key={idx} className="habit-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="habit-list-item-actions">
            {onEdit && (
              <button
                className="btn-icon"
                onClick={() => onEdit(habit)}
                aria-label="Editar tarea"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                className="btn-icon danger"
                onClick={() => onDelete(habit.id)}
                aria-label="Eliminar tarea"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
