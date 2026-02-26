import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Habit, Entry, Periodicity, Category } from '../types';
import { RadarChart } from '../components/radar/RadarChart';
import { RadarSummary } from '../components/radar/RadarSummary';
import { QuickInput } from '../components/input/QuickInput';
import { useTodayStats } from '../hooks/useTodayStats';
import { calculateLevel } from '../utils/streakCalculator';
import {
  getTodayISO,
  addDaysToDateISO,
  getDayOfWeekFromDateISO,
  formatDateLabel,
  timestampToISO
} from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

interface HomePageProps {
  habits: Habit[];
  entries: Entry[];
  onToggleEntry: (habit: Habit, targetDateISO?: string) => void;
  onCreateHabit: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  onTogglePin: (habitId: string) => boolean;
  onUpdateHabit?: (habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  onDeleteHabit?: (habitId: string) => void;
}

export function HomePage({
  habits,
  entries,
  onToggleEntry,
  onCreateHabit,
  onTogglePin,
  onUpdateHabit,
  onDeleteHabit
}: HomePageProps) {
  const location = useLocation();
  const { registrationDateISO } = useAuth();
  const [viewingDate, setViewingDate] = useState<string>(() => {
    const state = location.state as { dateISO?: string } | null;
    return state?.dateISO || getTodayISO();
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleLabelClick = useCallback(() => {
    if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  }, []);

  // When navigating from history with a new date, update the viewing date
  useEffect(() => {
    const state = location.state as { dateISO?: string } | null;
    if (state?.dateISO) {
      setViewingDate(state.dateISO);
    }
  }, [location.state, registrationDateISO]);

  const handleCategoryClick = useCallback((category: Category) => {
    setSelectedCategory(prev => prev === category ? null : category);
  }, []);

  const handleCategoryFilterClear = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate) {
      setViewingDate(newDate);
    }
  }, []);

  const periodLabel = formatDateLabel(viewingDate);

  const canGoBack = true; // Permite ir al pasado sin restricciones

  const periodEntries = useMemo(() => {
    return entries.filter(e => e.dateISO === viewingDate);
  }, [viewingDate, entries]);

  const periodHabits = useMemo(() => {
    const dayOfWeek = getDayOfWeekFromDateISO(viewingDate);
    const todayISO = getTodayISO();

    // Pre-compute Set of habitIds that have any entry globally (for carry-over check)
    const habitsWithAnyEntry = new Set(entries.map(e => e.habitId));

    // Build a map from habitId -> set of dateISOs where entries exist
    const entryDatesByHabit = new Map<string, Set<string>>();
    entries.forEach(e => {
      if (!entryDatesByHabit.has(e.habitId)) {
        entryDatesByHabit.set(e.habitId, new Set());
      }
      entryDatesByHabit.get(e.habitId)!.add(e.dateISO);
    });

    const scheduledHabitIds = new Set<string>();

    habits.forEach(h => {
      // Don't show habit if viewing date is before creation date
      // (Unless it has entries on that date, which is handled separately later)
      const createdAtISO = timestampToISO(h.createdAt);
      if (viewingDate < createdAtISO) {
        return;
      }

      const p = h.periodicity || Periodicity.daily;
      if (p === Periodicity.once) {
        // 1. Show on the exact target date always (completed or not)
        if (h.targetDate && h.targetDate === viewingDate) {
          scheduledHabitIds.add(h.id);
          return;
        }

        // 2. Show completed once-tasks on the date their entry was created
        const habitEntryDates = entryDatesByHabit.get(h.id);
        if (habitEntryDates && habitEntryDates.has(viewingDate)) {
          scheduledHabitIds.add(h.id);
          return;
        }

        // 3. Carry-over: show uncompleted once-tasks on today
        if (viewingDate === todayISO && !habitsWithAnyEntry.has(h.id)) {
          // No targetDate, or targetDate <= today, and no entries anywhere
          if (!h.targetDate || h.targetDate <= todayISO) {
            scheduledHabitIds.add(h.id);
          }
          return;
        }

        return;
      }
      if (p !== Periodicity.daily) return;
      const days = h.daysOfWeek || ALL_DAYS;
      if (days.includes(dayOfWeek)) scheduledHabitIds.add(h.id);
    });

    // Also include habits that have entries in this period (for historical view)
    const habitIdsWithEntries = new Set(periodEntries.map(e => e.habitId));

    // Return unique habits that are either scheduled OR have entries
    return habits.filter(h => scheduledHabitIds.has(h.id) || habitIdsWithEntries.has(h.id));
  }, [viewingDate, habits, entries, periodEntries]);

  // Filter entries to only include those from current period habits
  const filteredPeriodEntries = useMemo(() => {
    const periodHabitIds = new Set(periodHabits.map(h => h.id));
    return periodEntries.filter(e => periodHabitIds.has(e.habitId));
  }, [periodEntries, periodHabits]);

  const todayStats = useTodayStats(filteredPeriodEntries, periodHabits);
  const level = useMemo(() => calculateLevel(entries), [entries]);

  return (
    <div className="home-page">
      <section className="radar-section">
        <div className="period-nav-wrapper">
          <div className="period-nav">
            <button
              className="period-nav-btn"
              onClick={() => setViewingDate(prev => addDaysToDateISO(prev, -1))}
              aria-label="Anterior"
              disabled={!canGoBack}
            >
              &lt;
            </button>
            <div className="period-nav-label-container" onClick={handleLabelClick}>
              <span className="period-nav-label">{periodLabel}</span>
              <input
                ref={dateInputRef}
                type="date"
                className="period-date-picker-input-hidden"
                value={viewingDate}
                onChange={handleDateChange}
                aria-label="Seleccionar fecha"
              />
            </div>
            <button
              className="period-nav-btn"
              onClick={() => setViewingDate(prev => addDaysToDateISO(prev, 1))}
              aria-label="Siguiente"
            >
              &gt;
            </button>
          </div>
        </div>

        <RadarChart
          data={todayStats.radarData}
          onCategoryClick={handleCategoryClick}
          selectedCategory={selectedCategory}
        />
        <RadarSummary stats={todayStats} level={level} />
      </section>

      <section className="input-section">
        <QuickInput
          habits={periodHabits}
          periodEntries={periodEntries}
          periodDate={viewingDate}

          onToggleHabit={onToggleEntry}
          onCreateHabit={onCreateHabit}
          onTogglePin={onTogglePin}
          onUpdateHabit={onUpdateHabit}
          onDeleteHabit={onDeleteHabit}
          selectedCategory={selectedCategory}
          onCategoryFilterClear={handleCategoryFilterClear}
        />
      </section>
    </div>
  );
}
