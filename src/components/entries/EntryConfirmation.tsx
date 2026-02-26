import { Entry, Habit } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';

interface EntryConfirmationProps {
  entry: Entry;
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  warningMessage?: string;
}

export function EntryConfirmation({
  entry,
  habit,
  isOpen,
  onClose,
  warningMessage
}: EntryConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content entry-confirmation" onClick={(e) => e.stopPropagation()}>
        <div className="entry-confirmation-header success">
          <div className="success-icon">✓</div>
          <h2>¡Tarea completada!</h2>
        </div>

        <div className="entry-confirmation-body">
          <div className="habit-info">
            <h3>{habit.name}</h3>
            <CategoryBadge category={habit.category} />
          </div>

          {warningMessage && (
            <div className="warning-message">
              {warningMessage}
            </div>
          )}

          {entry.unitValue && (
            <div className="unit-value-display">
              Valor registrado: {entry.unitValue} {habit.unitType === 'min' ? 'min' : 'unidades'}
            </div>
          )}
        </div>

        <div className="entry-confirmation-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
