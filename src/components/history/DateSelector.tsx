import { getTodayISO } from '../../utils/dateUtils';

interface DateSelectorProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  min?: string;
}

export function DateSelector({ value, onChange, className, min }: DateSelectorProps) {
  const today = getTodayISO();

  return (
    <div className={`date-selector ${className || ''}`}>
      <label htmlFor="date-input">Seleccionar fecha</label>
      <input
        id="date-input"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={today}
        className="date-input"
      />
    </div>
  );
}
