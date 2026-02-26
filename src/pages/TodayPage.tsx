import { useMemo } from 'react';
import { Habit, Entry } from '../types';
import { TodayEntryList } from '../components/entries/TodayEntryList';
import { RadarSummary } from '../components/radar/RadarSummary';
import { useTodayStats } from '../hooks/useTodayStats';
import { calculateLevel } from '../utils/streakCalculator';
import { getTodayISO, formatDate } from '../utils/dateUtils';

interface TodayPageProps {
  habits: Habit[];
  entries: Entry[];
  todayEntries: Entry[];
  onUpdateEntry: (updatedEntry: Entry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export function TodayPage({ habits, entries, todayEntries, onUpdateEntry, onDeleteEntry }: TodayPageProps) {
  const todayStats = useTodayStats(todayEntries, habits);
  const level = useMemo(() => calculateLevel(entries), [entries]);
  const today = getTodayISO();

  return (
    <div className="today-page">
      <header className="page-header">
        <h1>Hoy</h1>
        <p className="page-subtitle">{formatDate(today)}</p>
      </header>

      <section className="stats-summary">
        <RadarSummary stats={todayStats} level={level} />
      </section>

      <section className="entries-section">
        <TodayEntryList
          entries={todayEntries}
          habits={habits}
          onUpdateEntry={onUpdateEntry}
          onDeleteEntry={onDeleteEntry}
        />
      </section>
    </div>
  );
}
