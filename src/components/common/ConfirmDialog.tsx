import { ReactNode, useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'warning' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default'
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`confirm-dialog-header ${variant}`}>
          <h2 id="confirm-dialog-title">{title}</h2>
        </div>
        <div className="confirm-dialog-body">
          <p id="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn btn-${variant === 'danger' ? 'danger' : 'primary'}`}
            onClick={() => { onConfirm(); onCancel(); }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
