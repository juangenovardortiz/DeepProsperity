import { RadarData } from '../../types';
import { RadarChart } from '../radar/RadarChart';
import { formatDate } from '../../utils/dateUtils';

interface HistoricalRadarProps {
  data: RadarData;
  date: string;
  entryCount: number;
  className?: string;
}

export function HistoricalRadar({ data, date, entryCount, className }: HistoricalRadarProps) {
  return (
    <div className={`historical-radar ${className || ''}`}>
      <h3>{formatDate(date)}</h3>
      <RadarChart data={data} />
      <div className="historical-stats">
        <div className="stat">
          <span className="stat-label">Tareas:</span>
          <span className="stat-value">{entryCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Equilibrio:</span>
          <span className="stat-value">{data.balanceScore.toFixed(0)}/100</span>
        </div>
      </div>
    </div>
  );
}
