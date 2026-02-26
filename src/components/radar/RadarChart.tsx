import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { RadarData, Category } from '../../types';
import { CATEGORIES_ORDER, CATEGORY_CONFIG } from '../../types/constants';

// Plugin personalizado para renderizar iconos grandes encima de los nombres
const createCustomLabelsPlugin = (selectedCategory: Category | null): Plugin<'radar'> => ({
  id: 'customLabels',
  afterDatasetsDraw: (chart) => {
    const { ctx } = chart;
    const scale = chart.scales.r as any;

    if (!scale) return;

    const centerX = scale.xCenter;
    const centerY = scale.yCenter;
    const radius = scale.drawingArea;

    const labelFontSize = 11;
    const iconFontSize = 28; // Iconos grandes
    const extraPadding = 35; // Espacio para iconos (reducido para hexágono más grande)
    const iconLabelGap = 8; // Espacio entre icono y texto

    const totalPoints = CATEGORIES_ORDER.length;
    const angleStep = (2 * Math.PI) / totalPoints;
    const startAngle = -Math.PI / 2; // Comenzar desde arriba (0 grados apunta a la derecha, -90 grados arriba)

    CATEGORIES_ORDER.forEach((category, index) => {
      const angle = startAngle + angleStep * index;
      const isSelected = selectedCategory === category;

      // Ajustar padding según posición
      let adjustedPadding = extraPadding;
      if (index === 0) { // Cuerpo está en índice 0 (arriba)
        adjustedPadding = extraPadding - 17; // Reducir más para que esté más cerca y no se corte
      } else if (index === 3) { // Dinero está en índice 3 (abajo)
        adjustedPadding = extraPadding + 8; // Aumentar 8px para bajarlo más
      }

      const labelRadius = radius + adjustedPadding;

      // Calcular posición base
      const baseX = centerX + Math.cos(angle) * labelRadius;
      const baseY = centerY + Math.sin(angle) * labelRadius;

      const icon = CATEGORY_CONFIG[category].icon;
      const label = CATEGORY_CONFIG[category].label;

      // Si está seleccionado, dibujar un círculo de fondo
      if (isSelected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(baseX, baseY, 35, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(54, 162, 235, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(54, 162, 235, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Dibujar icono (grande, centrado)
      ctx.save();
      ctx.font = `${iconFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = isSelected ? '#3498db' : '#2c3e50';
      ctx.fillText(icon, baseX, baseY - iconLabelGap/2);
      ctx.restore();

      // Dibujar label (más pequeño, debajo del icono, centrado)
      ctx.save();
      ctx.font = `bold ${labelFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isSelected ? '#3498db' : '#2c3e50';
      ctx.fillText(label, baseX, baseY + iconLabelGap/2);
      ctx.restore();
    });
  }
});

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  data: RadarData;
  className?: string;
  onCategoryClick?: (category: Category) => void;
  selectedCategory?: Category | null;
}

export function RadarChart({ data, className, onCategoryClick, selectedCategory }: RadarChartProps) {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!onCategoryClick || !chartRef.current) return;

    const canvas = chartRef.current.canvas;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      const chart = chartRef.current;
      if (!chart) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const scale = chart.scales.r as any;
      if (!scale) return;

      const centerX = scale.xCenter;
      const centerY = scale.yCenter;
      const radius = scale.drawingArea;

      const totalPoints = CATEGORIES_ORDER.length;
      const angleStep = (2 * Math.PI) / totalPoints;
      const startAngle = -Math.PI / 2;

      // Check which category was clicked
      for (let index = 0; index < CATEGORIES_ORDER.length; index++) {
        const category = CATEGORIES_ORDER[index];
        const angle = startAngle + angleStep * index;

        let adjustedPadding = 35;
        if (index === 0) adjustedPadding = 35 - 17;
        else if (index === 3) adjustedPadding = 35 + 8;

        const labelRadius = radius + adjustedPadding;
        const labelX = centerX + Math.cos(angle) * labelRadius;
        const labelY = centerY + Math.sin(angle) * labelRadius;

        // Create a clickable area around the icon and label (40px radius)
        const distance = Math.sqrt(Math.pow(x - labelX, 2) + Math.pow(y - labelY, 2));
        if (distance < 40) {
          onCategoryClick(category);
          return;
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.style.cursor = 'pointer';

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.style.cursor = 'default';
    };
  }, [onCategoryClick]);

  const chartData = {
    labels: CATEGORIES_ORDER.map(cat => CATEGORY_CONFIG[cat].label),
    datasets: [
      {
        label: 'Progreso del Día',
        data: CATEGORIES_ORDER.map(cat => data.percentages[cat]),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: CATEGORIES_ORDER.map(cat => CATEGORY_CONFIG[cat].color),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: CATEGORIES_ORDER.map(cat => CATEGORY_CONFIG[cat].color),
        pointHoverRadius: 7
      }
    ]
  };

  // Unregister old plugin if exists and register new one with current selectedCategory
  useEffect(() => {
    ChartJS.unregister({ id: 'customLabels' } as any);
    const customLabelsPlugin = createCustomLabelsPlugin(selectedCategory || null);
    ChartJS.register(customLabelsPlugin);

    return () => {
      ChartJS.unregister({ id: 'customLabels' } as any);
    };
  }, [selectedCategory]);

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function(value) {
            return value + '%';
          }
        },
        pointLabels: {
          display: true,
          font: {
            size: 11,
            weight: 'bold'
          },
          padding: 35, // Debe coincidir con extraPadding del plugin
          color: 'transparent', // Ocultar labels originales
          callback: function() {
            return ''; // Retornar vacío para que el plugin dibuje los labels personalizados
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.r.toFixed(1)}%`;
          }
        }
      }
    }
  };

  return (
    <div className={`radar-chart-container ${className || ''}`}>
      <Radar ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
