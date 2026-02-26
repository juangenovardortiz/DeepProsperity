import { useState, useRef } from 'react';
import { Habit, Entry, Category, Periodicity } from '../../types';
import { HabitChip } from './HabitChip';
import { HabitModal } from '../habits/HabitModal';
import { CATEGORIES_ORDER, CATEGORY_CONFIG } from '../../types/constants';
import { getTodayISO } from '../../utils/dateUtils';

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

function isHabitCompletedInPeriod(habit: Habit, entries: Entry[]): boolean {
  // Since periodEntries is already filtered for the correct period,
  // we just need to check if there are any entries for this habit
  const habitEntries = entries.filter(e => e.habitId === habit.id);
  return habitEntries.length > 0;
}

interface QuickInputProps {
  habits: Habit[];
  periodEntries: Entry[];
  periodDate?: string;
  onToggleHabit: (habit: Habit, targetDateISO?: string) => void;
  onCreateHabit: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  onTogglePin: (habitId: string) => boolean;
  onUpdateHabit?: (habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  onDeleteHabit?: (habitId: string) => void;
  selectedCategory?: Category | null;
  onCategoryFilterClear?: () => void;
  className?: string;
}

export function QuickInput({ habits, periodEntries, periodDate, onToggleHabit, onCreateHabit, onTogglePin, onUpdateHabit, onDeleteHabit, selectedCategory, onCategoryFilterClear, className }: QuickInputProps) {
  const isPastDate = periodDate ? periodDate < getTodayISO() : false;
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isTask, setIsTask] = useState(true);
  const [newTaskDaysOfWeek, setNewTaskDaysOfWeek] = useState<number[]>(ALL_DAYS);
  const [isBeforeSleep, setIsBeforeSleep] = useState(false);
  const [draggedHabit, setDraggedHabit] = useState<Habit | null>(null);
  const [dragOverHabit, setDragOverHabit] = useState<Habit | null>(null);
  const [dragOverSection, setDragOverSection] = useState<'regular' | 'beforeSleep' | 'completed' | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editMode, setEditMode] = useState(false);
  const isDraggingRef = useRef(false);

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleEditSave = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit && onUpdateHabit) {
      onUpdateHabit(editingHabit.id, habitData);
    }
    setEditingHabit(null);
  };

  // Show pinned habits, once-tasks, or habits with entries in this period
  const pinnedOrCompletedHabits = habits.filter(h => {
    if (h.isPinned) return true;
    if ((h.periodicity || Periodicity.daily) === Periodicity.once) return true;
    // Also show if this habit has entries in the current period
    return periodEntries.some(e => e.habitId === h.id);
  });

  // Filter by selected category
  const filteredHabits = pinnedOrCompletedHabits.filter(h => {
    if (selectedCategory && h.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleAddClick = () => {
    setShowCategoryPicker(true);
  };

  const handleCategorySelect = (category: Category) => {
    if (!newTaskName.trim()) return;

    // Calculate order so new items appear first in the list
    const minOrder = Math.min(0, ...habits.map(h => h.order ?? 0));

    const finalPeriodicity = isTask ? Periodicity.once : Periodicity.daily;

    onCreateHabit({
      name: newTaskName.trim(),
      description: newTaskDescription.trim() || undefined,
      category,
      xp: 0,
      isPinned: true,
      periodicity: finalPeriodicity,
      order: minOrder - 1,
      isBeforeSleep,
      ...(finalPeriodicity === Periodicity.daily ? { daysOfWeek: newTaskDaysOfWeek } : {}),
      ...(finalPeriodicity === Periodicity.once && periodDate ? { targetDate: periodDate } : {})
    });
    setNewTaskName('');
    setNewTaskDescription('');
    setIsTask(true);
    setIsBeforeSleep(false);
    setNewTaskDaysOfWeek(ALL_DAYS);
    setShowCategoryPicker(false);
  };

  const handleToggleDayOfWeek = (day: number) => {
    setNewTaskDaysOfWeek(prev => {
      if (prev.includes(day)) {
        if (prev.length <= 1) return prev; // Keep at least 1 day
        return prev.filter(d => d !== day);
      }
      return [...prev, day];
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    if (onDeleteHabit) {
      onDeleteHabit(habitId);
    }
  };

  const handleMoveHabit = (habit: Habit, direction: 'up' | 'down') => {
    if (!onUpdateHabit) return;
    const isCompleted = isHabitCompletedInPeriod(habit, periodEntries);
    const group = filteredHabits
      .filter(h => isHabitCompletedInPeriod(h, periodEntries) === isCompleted)
      .sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999));

    const idx = group.findIndex(h => h.id === habit.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= group.length) return;

    const currentOrder = group[idx].order ?? idx;
    const swapOrder = group[swapIdx].order ?? swapIdx;
    onUpdateHabit(habit.id, { order: swapOrder });
    onUpdateHabit(group[swapIdx].id, { order: currentOrder });
  };

  const tabLabel = 'Diarias';


  // Separate habits into incomplete and completed
  const incompleteHabits = filteredHabits
    .filter(h => !isHabitCompletedInPeriod(h, periodEntries))
    .sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999));

  // Sub-divide incomplete into regular and "antes de dormir"
  const regularIncomplete = incompleteHabits.filter(h => !h.isBeforeSleep);
  const beforeSleepIncomplete = incompleteHabits.filter(h => h.isBeforeSleep);

  const completedHabits = filteredHabits
    .filter(h => isHabitCompletedInPeriod(h, periodEntries))
    .sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999));

  // Determine which section a habit belongs to
  const getHabitSection = (habit: Habit): 'regular' | 'beforeSleep' | 'completed' => {
    if (isHabitCompletedInPeriod(habit, periodEntries)) return 'completed';
    if (habit.isBeforeSleep) return 'beforeSleep';
    return 'regular';
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, habit: Habit) => {
    setDraggedHabit(habit);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, habit: Habit) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverHabit(habit);
  };

  const handleSectionDragOver = (e: React.DragEvent, section: 'regular' | 'beforeSleep' | 'completed') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(section);
  };

  const handleDragEnd = () => {
    setDraggedHabit(null);
    setDragOverHabit(null);
    setDragOverSection(null);
    // Keep the flag active briefly to suppress the click event that fires after a real drop
    setTimeout(() => { isDraggingRef.current = false; }, 100);
  };

  // Drop on a specific habit (reorder within same section, or move across sections)
  const handleDrop = async (e: React.DragEvent, targetHabit: Habit) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;

    if (!draggedHabit || !onUpdateHabit || draggedHabit.id === targetHabit.id) {
      setDraggedHabit(null);
      setDragOverHabit(null);
      setDragOverSection(null);
      return;
    }

    const sourceSection = getHabitSection(draggedHabit);
    const targetSection = getHabitSection(targetHabit);

    if (sourceSection === targetSection) {
      // Same section: reorder
      const sameGroup = targetSection === 'completed' ? completedHabits
        : targetSection === 'beforeSleep' ? beforeSleepIncomplete
          : regularIncomplete;

      const draggedIndex = sameGroup.findIndex(h => h.id === draggedHabit.id);
      const targetIndex = sameGroup.findIndex(h => h.id === targetHabit.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const reordered = [...sameGroup];
        const [removed] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, removed);
        await Promise.all(reordered.map((habit, index) => onUpdateHabit(habit.id, { order: index })));
      }
    } else {
      // Cross-section move
      await handleCrossSectionMove(draggedHabit, sourceSection, targetSection);
    }

    setDraggedHabit(null);
    setDragOverHabit(null);
    setDragOverSection(null);
  };

  // Drop on a section zone (empty area or header)
  const handleSectionDrop = async (e: React.DragEvent, targetSection: 'regular' | 'beforeSleep' | 'completed') => {
    e.preventDefault();
    isDraggingRef.current = true;

    if (!draggedHabit || !onUpdateHabit) {
      setDraggedHabit(null);
      setDragOverHabit(null);
      setDragOverSection(null);
      return;
    }

    const sourceSection = getHabitSection(draggedHabit);

    if (sourceSection !== targetSection) {
      await handleCrossSectionMove(draggedHabit, sourceSection, targetSection);
    }

    setDraggedHabit(null);
    setDragOverHabit(null);
    setDragOverSection(null);
  };

  // Handle moving a habit from one section to another
  const handleCrossSectionMove = async (
    habit: Habit,
    from: 'regular' | 'beforeSleep' | 'completed',
    to: 'regular' | 'beforeSleep' | 'completed'
  ) => {
    if (!onUpdateHabit) return;

    // Moving to/from completed requires toggling the entry
    const wasCompleted = from === 'completed';
    const willComplete = to === 'completed';

    // Update isBeforeSleep property
    if (to === 'beforeSleep') {
      onUpdateHabit(habit.id, { isBeforeSleep: true });
    } else if (to === 'regular') {
      onUpdateHabit(habit.id, { isBeforeSleep: false });
    }

    // Toggle completion if needed
    if (wasCompleted !== willComplete) {
      onToggleHabit(habit, periodDate);
    }
  };

  return (
    <div className={`quick-input ${className || ''}`}>
      <div className="quick-create">
        {isPastDate ? (
          <p className="past-date-message">No se pueden crear tareas en días anteriores a hoy.</p>
        ) : (
          <div className="quick-create-input">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddClick(); }}
              placeholder="Nueva tarea o hábito..."
              className="form-input"
              disabled={showCategoryPicker}
            />
            <button
              className="btn btn-primary quick-create-add"
              onClick={handleAddClick}
              disabled={showCategoryPicker}
            >
              +
            </button>
          </div>
        )}
        {!isPastDate && showCategoryPicker && (
          <div className="quick-create-categories">
            <p className="quick-create-label">Nombre:</p>
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Nueva tarea o hábito..."
              className="form-input"
              autoFocus
            />
            <p className="quick-create-label">Descripción (opcional):</p>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Breve descripción..."
              className="form-input"
              rows={2}
              maxLength={150}
            />
            <p className="quick-create-label">Tipo:</p>
            <div className="periodicity-selector">
              <button
                className={`periodicity-btn ${isTask ? 'active' : ''}`}
                onClick={() => setIsTask(true)}
              >
                Tarea
              </button>
              <button
                className={`periodicity-btn ${!isTask ? 'active' : ''}`}
                onClick={() => setIsTask(false)}
              >
                Hábito
              </button>
            </div>

            {!isTask && (
              <>
                <p className="quick-create-label">Días:</p>
                <div className="day-selector">
                  {DAY_LABELS.map(({ day, label }) => (
                    <button
                      key={day}
                      className={`day-btn ${newTaskDaysOfWeek.includes(day) ? 'active' : ''}`}
                      onClick={() => handleToggleDayOfWeek(day)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
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
            <p className="quick-create-label">Categoría:</p>
            <div className="category-grid">
              {CATEGORIES_ORDER.map(cat => {
                const config = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    className="category-option"
                    data-category={cat}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              className="btn btn-secondary quick-create-cancel"
              onClick={() => {
                setShowCategoryPicker(false);
                setNewTaskName('');
                setNewTaskDescription('');
                setIsTask(true);
                setIsBeforeSleep(false);
                setNewTaskDaysOfWeek(ALL_DAYS);
              }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {filteredHabits.length > 0 ? (
        <>
          <div className="most-used-section">
            <div className="section-header-row">
              <h4>
                Mis Tareas {tabLabel}
                {selectedCategory && onCategoryFilterClear && (
                  <button
                    onClick={onCategoryFilterClear}
                    className="category-filter-badge"
                    title="Quitar filtro"
                  >
                    {CATEGORY_CONFIG[selectedCategory].icon} {CATEGORY_CONFIG[selectedCategory].label}
                    <span style={{ marginLeft: '2px', fontWeight: 'bold' }}>×</span>
                  </button>
                )}
              </h4>
              {(onUpdateHabit || onDeleteHabit) && (
                <button
                  className={`edit-mode-toggle ${editMode ? 'active' : ''}`}
                  onClick={() => setEditMode(prev => !prev)}
                >
                  {editMode ? 'Listo' : 'Editar'}
                </button>
              )}
            </div>

            {!editMode ? (
              /* === NORMAL MODE === */
              <>
                {regularIncomplete.length > 0 ? (
                  <div
                    className={`habit-chips ${draggedHabit && dragOverSection === 'regular' && getHabitSection(draggedHabit) !== 'regular' ? 'drop-zone-active' : ''}`}
                    onDragOver={(e) => handleSectionDragOver(e, 'regular')}
                    onDragLeave={() => setDragOverSection(null)}
                    onDrop={(e) => handleSectionDrop(e, 'regular')}
                  >
                    {regularIncomplete.map(habit => (
                      <div
                        key={habit.id}
                        draggable={!!onUpdateHabit}
                        onDragStart={(e) => handleDragStart(e, habit)}
                        onDragOver={(e) => handleDragOver(e, habit)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, habit)}
                        className={`habit-chip-container ${draggedHabit?.id === habit.id ? 'dragging' : ''} ${dragOverHabit?.id === habit.id ? 'drag-over' : ''}`}
                        style={{ cursor: onUpdateHabit ? 'grab' : 'default' }}
                      >
                        <HabitChip
                          habit={habit}
                          onClick={() => { if (!isDraggingRef.current) onToggleHabit(habit, periodDate); }}
                          isCompleted={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : beforeSleepIncomplete.length === 0 ? (
                  <p className="empty-state-hint" style={{ textAlign: 'center', padding: '8px 0' }}>¡Todas las tareas completadas!</p>
                ) : null}

                {(beforeSleepIncomplete.length > 0 || draggedHabit) && (
                  <div
                    className={`before-sleep-section ${draggedHabit && dragOverSection === 'beforeSleep' && getHabitSection(draggedHabit) !== 'beforeSleep' ? 'drop-zone-active' : ''}`}
                    onDragOver={(e) => handleSectionDragOver(e, 'beforeSleep')}
                    onDragLeave={() => setDragOverSection(null)}
                    onDrop={(e) => handleSectionDrop(e, 'beforeSleep')}
                  >
                    <h5 className="before-sleep-header">Antes de Dormir 🌙</h5>
                    <div className="habit-chips">
                      {beforeSleepIncomplete.map(habit => (
                        <div
                          key={habit.id}
                          draggable={!!onUpdateHabit}
                          onDragStart={(e) => handleDragStart(e, habit)}
                          onDragOver={(e) => handleDragOver(e, habit)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, habit)}
                          className={`habit-chip-container ${draggedHabit?.id === habit.id ? 'dragging' : ''} ${dragOverHabit?.id === habit.id ? 'drag-over' : ''}`}
                          style={{ cursor: onUpdateHabit ? 'grab' : 'default' }}
                        >
                          <HabitChip
                            habit={habit}
                            onClick={() => { if (!isDraggingRef.current) onToggleHabit(habit, periodDate); }}
                            isCompleted={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* === EDIT MODE === */
              <>
                <div className="edit-mode-list">
                  {regularIncomplete.map((habit, idx) => (
                    <div key={habit.id} className="edit-mode-item">
                      <div className="edit-mode-move-btns">
                        <button
                          className="edit-mode-move-btn"
                          onClick={() => handleMoveHabit(habit, 'up')}
                          disabled={idx === 0}
                          aria-label="Subir"
                        >
                          ▲
                        </button>
                        <button
                          className="edit-mode-move-btn"
                          onClick={() => handleMoveHabit(habit, 'down')}
                          disabled={idx === regularIncomplete.length - 1}
                          aria-label="Bajar"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="edit-mode-info" data-category={habit.category}>
                        <span className="edit-mode-icon">{(CATEGORY_CONFIG[habit.category] ?? { icon: '📌' }).icon}</span>
                        <span className="edit-mode-name">{habit.name}</span>
                      </div>
                      <div className="edit-mode-actions">
                        {onUpdateHabit && (
                          <button
                            className="edit-mode-action-btn edit"
                            onClick={() => handleEditHabit(habit)}
                            aria-label="Editar"
                          >
                            ✏️
                          </button>
                        )}
                        {onDeleteHabit && (
                          <button
                            className="edit-mode-action-btn delete"
                            onClick={() => handleDeleteHabit(habit.id)}
                            aria-label="Eliminar"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {beforeSleepIncomplete.length > 0 && (
                  <>
                    <h5 className="before-sleep-header">Antes de Dormir 🌙</h5>
                    <div className="edit-mode-list">
                      {beforeSleepIncomplete.map((habit, idx) => (
                        <div key={habit.id} className="edit-mode-item">
                          <div className="edit-mode-move-btns">
                            <button
                              className="edit-mode-move-btn"
                              onClick={() => handleMoveHabit(habit, 'up')}
                              disabled={idx === 0}
                              aria-label="Subir"
                            >
                              ▲
                            </button>
                            <button
                              className="edit-mode-move-btn"
                              onClick={() => handleMoveHabit(habit, 'down')}
                              disabled={idx === beforeSleepIncomplete.length - 1}
                              aria-label="Bajar"
                            >
                              ▼
                            </button>
                          </div>
                          <div className="edit-mode-info" data-category={habit.category}>
                            <span className="edit-mode-icon">{(CATEGORY_CONFIG[habit.category] ?? { icon: '📌' }).icon}</span>
                            <span className="edit-mode-name">{habit.name}</span>
                          </div>
                          <div className="edit-mode-actions">
                            {onUpdateHabit && (
                              <button
                                className="edit-mode-action-btn edit"
                                onClick={() => handleEditHabit(habit)}
                                aria-label="Editar"
                              >
                                ✏️
                              </button>
                            )}
                            {onDeleteHabit && (
                              <button
                                className="edit-mode-action-btn delete"
                                onClick={() => handleDeleteHabit(habit.id)}
                                aria-label="Eliminar"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {(completedHabits.length > 0 || draggedHabit) && (
            <div
              className={`most-used-section completed-section ${draggedHabit && dragOverSection === 'completed' && getHabitSection(draggedHabit) !== 'completed' ? 'drop-zone-active' : ''}`}
              onDragOver={(e) => handleSectionDragOver(e, 'completed')}
              onDragLeave={() => setDragOverSection(null)}
              onDrop={(e) => handleSectionDrop(e, 'completed')}
            >
              <h4>Completadas ({completedHabits.length})</h4>
              {!editMode ? (
                <div className="habit-chips">
                  {completedHabits.map(habit => (
                    <div
                      key={habit.id}
                      draggable={!!onUpdateHabit}
                      onDragStart={(e) => handleDragStart(e, habit)}
                      onDragOver={(e) => handleDragOver(e, habit)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, habit)}
                      className={`habit-chip-container ${draggedHabit?.id === habit.id ? 'dragging' : ''} ${dragOverHabit?.id === habit.id ? 'drag-over' : ''}`}
                      style={{ cursor: onUpdateHabit ? 'grab' : 'default' }}
                    >
                      <HabitChip
                        habit={habit}
                        onClick={() => { if (!isDraggingRef.current) onToggleHabit(habit, periodDate); }}
                        isCompleted={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="edit-mode-list">
                  {completedHabits.map((habit, idx) => (
                    <div key={habit.id} className="edit-mode-item">
                      <div className="edit-mode-move-btns">
                        <button
                          className="edit-mode-move-btn"
                          onClick={() => handleMoveHabit(habit, 'up')}
                          disabled={idx === 0}
                          aria-label="Subir"
                        >
                          ▲
                        </button>
                        <button
                          className="edit-mode-move-btn"
                          onClick={() => handleMoveHabit(habit, 'down')}
                          disabled={idx === completedHabits.length - 1}
                          aria-label="Bajar"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="edit-mode-info" data-category={habit.category}>
                        <span className="edit-mode-icon">{(CATEGORY_CONFIG[habit.category] ?? { icon: '📌' }).icon}</span>
                        <span className="edit-mode-name">{habit.name}</span>
                      </div>
                      <div className="edit-mode-actions">
                        {onUpdateHabit && (
                          <button
                            className="edit-mode-action-btn edit"
                            onClick={() => handleEditHabit(habit)}
                            aria-label="Editar"
                          >
                            ✏️
                          </button>
                        )}
                        {onDeleteHabit && (
                          <button
                            className="edit-mode-action-btn delete"
                            onClick={() => handleDeleteHabit(habit.id)}
                            aria-label="Eliminar"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          {selectedCategory ? (
            <>
              <p>No tienes tareas {tabLabel.toLowerCase()} en {CATEGORY_CONFIG[selectedCategory].label}.</p>
              <p className="empty-state-hint">Haz clic en el hexagrama para ver todas las tareas o crea una nueva.</p>
            </>
          ) : (
            <p>Agrega tareas o hábitos para empezar</p>
          )}
        </div>
      )}

      <HabitModal
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        onSave={handleEditSave}
        habits={habits}
        onTogglePin={onTogglePin}
        onUpdateHabit={onUpdateHabit}
        onDeleteHabit={onDeleteHabit}
        initialData={editingHabit || undefined}
      />
    </div>
  );
}
