import { useState } from 'react';
import { Habit, Category } from '../types';
import { HabitList } from '../components/habits/HabitList';
import { HabitForm } from '../components/habits/HabitForm';
import { CategorySelector } from '../components/input/CategorySelector';

interface HabitsPageProps {
  habits: Habit[];
  onCreateHabit: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  onUpdateHabit: (habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  onDeleteHabit: (habitId: string) => void;
  onTogglePin: (habitId: string) => boolean;
}

export function HabitsPage({ habits, onCreateHabit, onUpdateHabit, onDeleteHabit, onTogglePin: _onTogglePin }: HabitsPageProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Filter by categories if any selected
  const filteredHabits = selectedCategories.length > 0
    ? habits.filter(h => selectedCategories.includes(h.category))
    : habits;

  const handleToggleCategory = (category: Category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleSave = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      onUpdateHabit(editingHabit.id, habitData);
      setEditingHabit(null);
    } else {
      onCreateHabit(habitData);
      setShowCreateForm(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingHabit(null);
  };

  const handleDelete = (habitId: string) => {
    onDeleteHabit(habitId);
  };

  return (
    <div className="habits-page">
      <header className="page-header">
        <h1>Mis Tareas</h1>
        <p className="page-subtitle">Tareas personalizados</p>
      </header>

      {(showCreateForm || editingHabit) ? (
        <div className="habit-form-section">
          <h2>{editingHabit ? 'Editar Tarea' : 'Crear Tarea'}</h2>
          <HabitForm
            onSave={handleSave}
            onCancel={handleCancel}
            initialData={editingHabit || undefined}
          />
        </div>
      ) : (
        <>
          <div className="habits-page-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              + Crear Tarea
            </button>
          </div>

          <CategorySelector
            selectedCategories={selectedCategories}
            onToggle={handleToggleCategory}
          />

          <HabitList
            habits={filteredHabits}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {habits.length === 0 && (
            <div className="empty-state">
              <p>Todavía no has creado tareas.</p>
              <p>Usa el botón "+ Crear Tarea" para empezar.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
