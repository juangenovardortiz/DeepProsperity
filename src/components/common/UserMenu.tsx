import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { clearAllData } from '../../services/firestoreService';
import { restoreDefaultHabits } from '../../services/habitService';
import { ConfirmDialog } from './ConfirmDialog';

const ADMIN_EMAIL = 'juangenovardortiz@gmail.com';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClearData = async () => {
    const result = await clearAllData();
    if (result.success) {
      setIsOpen(false);
      setShowClearConfirm(false);
      window.location.reload();
    }
  };

  const handleRestoreDefaults = async () => {
    const result = await restoreDefaultHabits();
    if (result.success) {
      setIsOpen(false);
      setShowRestoreConfirm(false);
      window.location.reload();
    } else {
      alert(result.message);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
      >
        <div className="user-avatar-wrapper">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <span className="user-menu-connected-email">{user.email}</span>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <p className="user-menu-name">{user.displayName || 'Usuario'}</p>
            <p className="user-menu-email">{user.email}</p>
          </div>
          <div className="user-menu-divider"></div>
          {isAdmin && (
            <>
              <button
                className="user-menu-item"
                onClick={() => {
                  setShowRestoreConfirm(true);
                  setIsOpen(false);
                }}
                style={{ color: 'var(--primary-color)' }}
              >
                <span>🔄</span>
                <span>Restaurar hábitos predeterminados</span>
              </button>
              <button
                className="user-menu-item"
                onClick={() => {
                  setShowClearConfirm(true);
                  setIsOpen(false);
                }}
                style={{ color: 'var(--danger-color)' }}
              >
                <span>🗑️</span>
                <span>Limpiar todos los datos</span>
              </button>
            </>
          )}
          <button className="user-menu-item" onClick={handleSignOut}>
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showRestoreConfirm}
        title="Restaurar hábitos predeterminados"
        message="Esto reemplazará todos tus hábitos actuales con los 21 hábitos predeterminados. ¿Estás seguro?"
        variant="warning"
        confirmText="Sí, restaurar"
        cancelText="Cancelar"
        onConfirm={handleRestoreDefaults}
        onCancel={() => setShowRestoreConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Limpiar todos los datos"
        message="Esto eliminará permanentemente todos tus hábitos y entradas. Esta acción no se puede deshacer. ¿Estás seguro?"
        variant="danger"
        confirmText="Sí, eliminar todo"
        cancelText="Cancelar"
        onConfirm={handleClearData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
