'use client';

import { useEffect } from 'react';
import styles from '@/app/ui/styles/confirmDeleteModal.module.css';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = 'Confirmar eliminación',
  message,
  itemName,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const normalizedMessage = message.trim().replace(/[?.!]+$/, '');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={!isProcessing ? onCancel : undefined}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.iconWrap} aria-hidden="true">
          <span className={styles.icon}>!</span>
        </div>

        <h3 id="confirm-delete-title" className={styles.title}>
          {title}
        </h3>

        <p className={styles.message}>
          {itemName ? (
            <>
              {normalizedMessage} <strong className={styles.itemName}>{itemName}</strong>?
            </>
          ) : (
            message
          )}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={styles.confirmButton}
            disabled={isProcessing}
          >
            {isProcessing ? 'Eliminando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
