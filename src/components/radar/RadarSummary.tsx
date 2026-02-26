import { TodayStats } from '../../types';

interface RadarSummaryProps {
  stats: TodayStats;
  level?: number;
  className?: string;
}

export function RadarSummary({ stats, level, className }: RadarSummaryProps) {
  const balanceScore = stats.radarData.balanceScore;
  const completionPercentage = stats.totalCount > 0
    ? (stats.entryCount / stats.totalCount) * 100
    : 0;

  return (
    <div className={`radar-summary ${className || ''}`}>
      {level !== undefined && (
        <div className="level-display">
          <span className="level-badge">{level}</span>
          <span className="level-label">Nivel</span>
        </div>
      )}
      <div className="radar-summary-grid">
        {/* Balance Score */}
        <div className="stat-card">
          <div className="stat-label">Nivel de Prosperidad</div>
          <div className="stat-value">
            {balanceScore.toFixed(0)} <span className="stat-max">/ 100</span>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill balance"
              style={{ width: `${balanceScore}%` }}
            />
          </div>
        </div>

        {/* Entry Count */}
        <div className="stat-card">
          <div className="stat-label">Tareas Completadas</div>
          <div className="stat-value">
            {stats.entryCount} <span className="stat-max">/ {stats.totalCount}</span>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill completion"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
