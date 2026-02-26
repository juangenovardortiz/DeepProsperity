import { useState, useEffect } from 'react';
import { Habit } from '../../types';
import { HabitForm } from './HabitForm';
import { CATEGORIES_ORDER, CATEGORY_CONFIG } from '../../types/constants';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  habits: Habit[];
  onTogglePin: (habitId: string) => boolean;
  onUpdateHabit?: (habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  onDeleteHabit?: (habitId: string) => void;
  initialData?: Partial<Habit>;
}

export function HabitModal({ isOpen, onClose, onSave, habits, onTogglePin, onUpdateHabit, onDeleteHabit, initialData }: HabitModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // When modal opens with initialData, show the form directly
  useEffect(() => {
    if (isOpen && initialData) {
      setShowCreateForm(true);
      if (initialData.id) {
        setEditingHabit(initialData as Habit);
      }
    } else if (!isOpen) {
      // Reset when modal closes
      setShowCreateForm(false);
      setEditingHabit(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit && onUpdateHabit) {
      onUpdateHabit(editingHabit.id, habitData);
    } else {
      onSave(habitData);
    }
    setShowCreateForm(false);
    setEditingHabit(null);
    onClose();
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowCreateForm(true);
  };

  const handleDelete = (habitId: string) => {
    if (onDeleteHabit) {
      onDeleteHabit(habitId);
    }
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingHabit(null);
  };

  const groupedHabits = CATEGORIES_ORDER.map(category => ({
    category,
    habits: habits.filter(h => h.category === category)
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content habit-modal large"
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="habit-modal-title">Gestionar Tareas Diarias</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="modal-body">
          {showCreateForm ? (
            <>
              <button
                className="btn btn-secondary modal-back-btn"
                onClick={handleCloseForm}
              >
                ← Volver a la lista
              </button>
              <HabitForm
                onSave={handleSave}
                onCancel={handleCloseForm}
                initialData={editingHabit || initialData}
              />
            </>
          ) : (
            <>
              <button
                className="btn btn-primary modal-create-btn"
                onClick={() => setShowCreateForm(true)}
              >
                + Crear Habito/Tarea
              </button>

              {/* All Habits Section */}
              {habits.length > 0 && (
                <>
                  <h3 className="modal-section-title">Mis Tareas</h3>
                  <p className="modal-description">
                    Edita o elimina tus tareas. Click en ☆ para añadir a favoritos, en ★ para quitar.
                  </p>
                  <div className="habits-by-category">
                    {groupedHabits.map(({ category, habits: categoryHabits }) => {
                      if (categoryHabits.length === 0) return null;
                      const config = CATEGORY_CONFIG[category];
                      return (
                        <div key={category} className="habit-category-section">
                          <h3 className="category-title">
                            <span aria-hidden="true">{config.icon}</span> {config.label}
                          </h3>
                          <div className="habit-list-modal">
                            {categoryHabits.map(habit => (
                              <div key={habit.id} className="habit-list-modal-item">
                                <span className="habit-name">{habit.name}</span>
                                <div className="habit-actions">
                                  <button
                                    className={`pin-btn ${habit.isPinned ? 'pinned' : ''}`}
                                    onClick={() => onTogglePin(habit.id)}
                                    aria-label={habit.isPinned ? `Quitar ${habit.name} de favoritos` : `Añadir ${habit.name} a favoritos`}
                                    aria-pressed={!!habit.isPinned}
                                  >
                                    {habit.isPinned ? '★' : '☆'}
                                  </button>
                                  <button
                                    className="btn-icon edit-btn"
                                    onClick={() => handleEdit(habit)}
                                    aria-label={`Editar ${habit.name}`}
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn-icon delete-btn"
                                    onClick={() => handleDelete(habit.id)}
                                    aria-label={`Eliminar ${habit.name}`}
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
