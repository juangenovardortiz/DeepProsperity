import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { TodayPage } from './pages/TodayPage';
import { HabitsPage } from './pages/HabitsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SummaryPage } from './pages/SummaryPage';
import { LoginPage } from './pages/LoginPage';
import { useHabits } from './hooks/useHabits';
import { useEntries } from './hooks/useEntries';
import { Habit, Entry } from './types';
import { FirebaseInit } from './components/common/FirebaseInit';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { CompletionEffectProvider } from './contexts/CompletionEffectContext';
import { useCompletionEffectContext } from './contexts/CompletionEffectContext';

import './App.css';

function AppContent() {
  const {
    habits,
    isLoading: habitsLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    togglePin
  } = useHabits();

  const {
    entries,
    isLoading: entriesLoading,
    toggleEntry,
    updateEntry,
    deleteEntry,
    getTodayEntries
  } = useEntries();

  const todayEntries = getTodayEntries();
  const { fireCompletionEffect } = useCompletionEffectContext();

  const handleToggleEntry = async (habit: Habit, targetDateISO?: string) => {
    const result = await toggleEntry(habit, targetDateISO);
    if (result.success && result.added) {
      fireCompletionEffect();
    }
  };

  const handleUpdateEntry = (updatedEntry: Entry) => {
    void updateEntry(updatedEntry);
  };

  const handleDeleteEntry = (entryId: string) => {
    void deleteEntry(entryId);
  };

  const handleCreateHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    void addHabit(habitData);
  };

  const handleUpdateHabit = (habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    return updateHabit(habitId, updates);
  };

  const handleTogglePin = (habitId: string): boolean => {
    void togglePin(habitId);
    return true; // Return true immediately for UI responsiveness
  };

  const handleDeleteHabit = (habitId: string): boolean => {
    void deleteHabit(habitId);
    return true; // Return true immediately for UI responsiveness
  };

  if (habitsLoading || entriesLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <FirebaseInit />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HomePage
                  habits={habits}
                  entries={entries}
                  onToggleEntry={handleToggleEntry}
                  onCreateHabit={handleCreateHabit}
                  onTogglePin={handleTogglePin}
                  onUpdateHabit={handleUpdateHabit}
                  onDeleteHabit={handleDeleteHabit}
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/today"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TodayPage
                  habits={habits}
                  entries={entries}
                  todayEntries={todayEntries}
                  onUpdateEntry={handleUpdateEntry}
                  onDeleteEntry={handleDeleteEntry}
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HabitsPage
                  habits={habits}
                  onCreateHabit={handleCreateHabit}
                  onUpdateHabit={handleUpdateHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onTogglePin={handleTogglePin}
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SummaryPage habits={habits} entries={entries} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HistoryPage habits={habits} entries={entries} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CompletionEffectProvider>
          <AppContent />
        </CompletionEffectProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
