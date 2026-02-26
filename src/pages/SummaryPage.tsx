import { useMemo } from 'react';
import { Habit, Entry, Category, RadarData } from '../types';
import { CATEGORIES_ORDER } from '../types/constants';
import { computeRadarData } from '../utils/radarCalculator';
import { calculateLevel } from '../utils/streakCalculator';
import { RadarChart } from '../components/radar/RadarChart';

interface SummaryPageProps {
  habits: Habit[];
  entries: Entry[];
}

export function SummaryPage({ habits, entries }: SummaryPageProps) {
  const { averageRadarData, totalDays, avgTasksPerDay } = useMemo(() => {
    // Group entries by date
    const entriesByDate = new Map<string, Entry[]>();
    entries.forEach(entry => {
      const dateEntries = entriesByDate.get(entry.dateISO) || [];
      dateEntries.push(entry);
      entriesByDate.set(entry.dateISO, dateEntries);
    });

    const totalDays = entriesByDate.size;

    if (totalDays === 0) {
      const zeroPercentages = Object.fromEntries(
        CATEGORIES_ORDER.map(cat => [cat, 0])
      ) as Record<Category, number>;
      return {
        averageRadarData: { percentages: zeroPercentages, balanceScore: 0 } as RadarData,
        totalDays: 0,
        avgTasksPerDay: 0
      };
    }

    // Accumulate percentages and balance scores across all days
    const sumPercentages = Object.fromEntries(
      CATEGORIES_ORDER.map(cat => [cat, 0])
    ) as Record<Category, number>;
    let sumBalanceScore = 0;
    let totalEntries = 0;

    entriesByDate.forEach((dayEntries) => {
      const radarData = computeRadarData(dayEntries, habits);
      CATEGORIES_ORDER.forEach(cat => {
        sumPercentages[cat] += radarData.percentages[cat];
      });
      sumBalanceScore += radarData.balanceScore;
      totalEntries += dayEntries.length;
    });

    // Calculate averages
    const avgPercentages = Object.fromEntries(
      CATEGORIES_ORDER.map(cat => [cat, sumPercentages[cat] / totalDays])
    ) as Record<Category, number>;

    return {
      averageRadarData: {
        percentages: avgPercentages,
        balanceScore: sumBalanceScore / totalDays
      } as RadarData,
      totalDays,
      avgTasksPerDay: totalEntries / totalDays
    };
  }, [entries, habits]);

  const level = useMemo(() => calculateLevel(entries), [entries]);

  return (
    <div className="summary-page">
      <header className="page-header">
        <h1>Resumen</h1>
        <p className="page-subtitle">Media de todos tus días</p>
      </header>

      {totalDays === 0 ? (
        <div className="empty-state">
          <p>No hay datos todavía.</p>
          <p className="text-muted">Completa tareas para ver tu resumen aquí.</p>
        </div>
      ) : (
        <>
          <RadarChart data={averageRadarData} />

          <div className="summary-stats">
            <div className="radar-summary-grid">
              <div className="stat-card">
                <div className="stat-label">Prosperidad Media</div>
                <div className="stat-value">
                  {averageRadarData.balanceScore.toFixed(0)} <span className="stat-max">/ 100</span>
                </div>
                <div className="stat-progress-bar">
                  <div
                    className="stat-progress-fill balance"
                    style={{ width: `${averageRadarData.balanceScore}%` }}
                  />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Nivel</div>
                <div className="stat-value">{level}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Días Activos</div>
                <div className="stat-value">{totalDays}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Media Tareas/Día</div>
                <div className="stat-value">{avgTasksPerDay.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
