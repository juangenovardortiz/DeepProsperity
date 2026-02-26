import { useRef, useState } from 'react';
import { Habit } from '../../types';
import { CATEGORY_CONFIG } from '../../types/constants';
import { useCompletionEffectContext } from '../../contexts/CompletionEffectContext';

interface HabitChipProps {
  habit: Habit;
  onClick: () => void;
  className?: string;
  isCompleted?: boolean;
}

export function HabitChip({ habit, onClick, className, isCompleted = false }: HabitChipProps) {
  const config = CATEGORY_CONFIG[habit.category] ?? { label: habit.category, color: '#888', icon: '📌' };
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { registerClickOrigin } = useCompletionEffectContext();
  const [justCompleted, setJustCompleted] = useState(false);

  const handleClick = () => {
    if (!isCompleted && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      registerClickOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        color: config.color,
      });
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 350);
    }
    onClick();
  };

  return (
    <div className={`habit-chip-wrapper ${className || ''}`}>
      <button
        ref={buttonRef}
        className={`habit-chip ${isCompleted ? 'completed' : ''} ${justCompleted ? 'just-completed' : ''}`}
        onClick={handleClick}
        aria-label={isCompleted ? `${habit.name} - completada` : habit.name}
        aria-pressed={isCompleted}
        data-category={habit.category}
        title={habit.description || habit.name}
      >
        {isCompleted && <span className="habit-chip-checkmark" aria-hidden="true">✓</span>}
        <span className="habit-chip-icon" aria-hidden="true">{config.icon}</span>
        <div className="habit-chip-content">
          <span className="habit-chip-name">{habit.name}</span>
          {habit.description && (
            <span className="habit-chip-description">{habit.description}</span>
          )}
        </div>
      </button>
    </div>
  );
}
