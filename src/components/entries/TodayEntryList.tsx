import { useState } from 'react';
import { Entry, Habit } from '../../types';
import { EntryItem } from './EntryItem';

interface TodayEntryListProps {
  entries: Entry[];
  habits: Habit[];
  onDeleteEntry: (entryId: string) => void;
  onUpdateEntry: (updatedEntry: Entry) => void;
  className?: string;
}

export function TodayEntryList({ entries, habits, onDeleteEntry, onUpdateEntry, className }: TodayEntryListProps) {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className={`today-entry-list empty ${className || ''}`}>
        <p className="empty-message">
          Todavía no has completado ningún tarea hoy. ¡Comienza ahora!
        </p>
      </div>
    );
  }

  const handleEdit = (entry: Entry) => {
    setEditingEntryId(prev => prev === entry.id ? null : entry.id);
  };

  const handleSave = (updatedEntry: Entry) => {
    onUpdateEntry(updatedEntry);
    setEditingEntryId(null);
  };

  const handleDelete = (entryId: string) => {
    onDeleteEntry(entryId);
    setEditingEntryId(null);
  };

  // Sort entries by timestamp (most recent first)
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className={`today-entry-list ${className || ''}`}>
      <h3 className="entry-list-title">Hoy ({entries.length})</h3>
      <div className="entry-list-items">
        {sortedEntries.map(entry => {
          const habit = habits.find(h => h.id === entry.habitId);
          return (
            <EntryItem
              key={entry.id}
              entry={entry}
              habit={habit}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onSave={handleSave}
              isEditing={editingEntryId === entry.id}
              showDate
            />
          );
        })}
      </div>
    </div>
  );
}
