import { useNavigate } from 'react-router-dom';
import { Habit, Entry } from '../types';
import { HistoricalDaysList } from '../components/history/HistoricalDaysList';

interface HistoryPageProps {
  habits: Habit[];
  entries: Entry[];
}

export function HistoryPage({ habits, entries }: HistoryPageProps) {
  const navigate = useNavigate();

  const handleSelectDate = (dateISO: string) => {
    navigate('/', { state: { dateISO } });
  };

  return (
    <div className="history-page">
      <header className="page-header">
        <h1>Historial</h1>
        <p className="page-subtitle">Revisa tu progreso pasado</p>
      </header>

      <HistoricalDaysList
        entries={entries}
        habits={habits}
        onSelectDate={handleSelectDate}
      />
    </div>
  );
}
