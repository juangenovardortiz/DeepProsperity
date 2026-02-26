import { Entry, Habit } from '../../types';
import { computeRadarData } from '../../utils/radarCalculator';
import { formatDate } from '../../utils/dateUtils';

interface HistoricalDaySummary {
  dateISO: string;
  completedTasks: number;
  totalTasks: number;
  prosperityLevel: number;
}

interface HistoricalDaysListProps {
  entries: Entry[];
  habits: Habit[];
  onSelectDate: (dateISO: string) => void;
}

export function HistoricalDaysList({ entries, habits, onSelectDate }: HistoricalDaysListProps) {
  // Group entries by date
  const entriesByDate = new Map<string, Entry[]>();

  entries.forEach(entry => {
    const dateEntries = entriesByDate.get(entry.dateISO) || [];
    dateEntries.push(entry);
    entriesByDate.set(entry.dateISO, dateEntries);
  });

  // Calculate total pinned tasks
  const totalPinnedTasks = habits.filter(h => h.isPinned).length;

  // Create summary for each day with activity
  const daySummaries: HistoricalDaySummary[] = [];

  entriesByDate.forEach((dateEntries, dateISO) => {
    const radarData = computeRadarData(dateEntries, habits);

    daySummaries.push({
      dateISO,
      completedTasks: dateEntries.length,
      totalTasks: totalPinnedTasks,
      prosperityLevel: Math.round(radarData.balanceScore)
    });
  });

  // Sort by date descending (most recent first)
  daySummaries.sort((a, b) => b.dateISO.localeCompare(a.dateISO));

  if (daySummaries.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay historial de tareas aún.</p>
        <p className="text-muted">Completa algunas tareas para ver tu progreso aquí.</p>
      </div>
    );
  }

  return (
    <div className="historical-days-list">
      <div className="list-header">
        <span className="header-date">Día</span>
        <span className="header-tasks">Tareas</span>
        <span className="header-prosperity">Prosperidad</span>
      </div>

      {daySummaries.map(summary => (
        <button
          key={summary.dateISO}
          className="day-summary-item"
          onClick={() => onSelectDate(summary.dateISO)}
        >
          <span className="day-date">{formatDate(summary.dateISO)}</span>
          <span className="day-tasks">
            {summary.completedTasks}/{summary.totalTasks}
          </span>
          <span className="day-prosperity">
            <span className="prosperity-value">{summary.prosperityLevel}</span>
            <span className="prosperity-bar">
              <span
                className="prosperity-fill"
                style={{ width: `${summary.prosperityLevel}%` }}
              />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
