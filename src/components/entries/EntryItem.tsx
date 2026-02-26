import { useState, useEffect, useRef } from 'react';
import { Entry, Habit, UnitType } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';

interface EntryItemProps {
  entry: Entry;
  habit: Habit | undefined;
  onDelete?: (entryId: string) => void;
  onEdit?: (entry: Entry) => void;
  onSave?: (updatedEntry: Entry) => void;
  isEditing?: boolean;
  showDate?: boolean;
  readonly?: boolean;
}

export function EntryItem({ entry, habit, onDelete, onEdit, onSave, isEditing = false, showDate = false, readonly = false }: EntryItemProps) {
  const [unitValue, setUnitValue] = useState<string>('');
  const [dateISO, setDateISO] = useState(entry.dateISO);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setUnitValue(entry.unitValue?.toString() || '');
      setDateISO(entry.dateISO);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing, entry.id]);

  if (!habit) return null;

  const formatUnitValue = (unitValue: number | undefined, unitType: UnitType | undefined) => {
    if (!unitValue || !unitType || unitType === UnitType.none) return null;
    if (unitType === UnitType.min) return `${unitValue} min`;
    if (unitType === UnitType.count) return unitValue.toLocaleString();
    return null;
  };

  const unitValueDisplay = formatUnitValue(entry.unitValue, habit.unitType);
  const hasUnit = habit.unitType && habit.unitType !== UnitType.none;
  const unitLabel = habit.unitType === UnitType.min ? 'minutos' : 'cantidad';

  const handleClick = () => {
    if (!readonly && onEdit && !isEditing) {
      onEdit(entry);
    }
  };

  const handleCancel = () => {
    if (onEdit) onEdit(entry); // Toggle off editing
  };

  const handleSave = () => {
    if (!onSave) return;
    const parsedValue = unitValue ? parseFloat(unitValue) : undefined;
    const updatedEntry: Entry = {
      ...entry,
      dateISO,
      ...(parsedValue !== undefined ? { unitValue: parsedValue } : {}),
    };
    if (!parsedValue && entry.unitValue) {
      delete (updatedEntry as Partial<Entry>).unitValue;
    }
    onSave(updatedEntry);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(entry.id);
  };

  const hasChanges = (
    dateISO !== entry.dateISO ||
    (hasUnit && unitValue !== (entry.unitValue?.toString() || ''))
  );

  if (isEditing) {
    return (
      <div className="entry-item entry-item-editing">
        <div className="entry-item-header">
          <span className="entry-item-name">{habit.name}</span>
          <CategoryBadge category={entry.categorySnapshot} size="small" />
        </div>

        <div className="entry-inline-edit">
          {hasUnit && (
            <div className="entry-edit-field">
              <label className="entry-edit-label">{unitLabel === 'minutos' ? 'Minutos' : 'Cantidad'}</label>
              <div className="entry-edit-input-row">
                <button
                  className="entry-edit-step-btn"
                  onClick={() => setUnitValue(prev => String(Math.max(0, (parseFloat(prev) || 0) - 1)))}
                >
                  -
                </button>
                <input
                  ref={inputRef}
                  type="number"
                  className="entry-edit-input"
                  value={unitValue}
                  onChange={(e) => setUnitValue(e.target.value)}
                  placeholder="0"
                  min="0"
                  inputMode="numeric"
                />
                <button
                  className="entry-edit-step-btn"
                  onClick={() => setUnitValue(prev => String((parseFloat(prev) || 0) + 1))}
                >
                  +
                </button>
              </div>
              <span className="entry-edit-hint">{unitLabel}</span>
            </div>
          )}

          <div className="entry-edit-field">
            <label className="entry-edit-label">Fecha</label>
            <input
              type="date"
              className="entry-edit-input entry-edit-date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
            />
          </div>

          <div className="entry-edit-meta">
            <span>Registrado: {new Date(entry.timestamp).toLocaleString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>

          <div className="entry-inline-actions">
            <button
              className="btn entry-edit-delete-btn"
              onClick={handleDelete}
            >
              Eliminar
            </button>
            <div className="entry-edit-actions-right">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!hasChanges && !hasUnit}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`entry-item ${!readonly && onEdit ? 'entry-item-editable' : ''}`}
      onClick={handleClick}
      {...(!readonly && onEdit ? {
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }
      } : {})}
    >
      <div className="entry-item-header">
        <span className="entry-item-name">{habit.name}</span>
      </div>

      <div className="entry-item-details">
        <CategoryBadge category={entry.categorySnapshot} size="small" />
        {unitValueDisplay && (
          <span className="entry-unit-value">{unitValueDisplay}</span>
        )}
        {showDate && (
          <span className="entry-timestamp">
            {new Date(entry.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
        {!readonly && onEdit && (
          <span className="entry-edit-indicator">Editar</span>
        )}
      </div>

      {!readonly && onDelete && (
        <button
          className="entry-item-delete"
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
          aria-label={`Eliminar entrada: ${habit.name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
