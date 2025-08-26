// hooks/useNavigationPromptWithModal.js
import { useState, useCallback } from 'react';
import { useNavigationPrompt } from './useNavigationPrompt';

export function useNavigationPromptWithModal(when) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [resolver, setResolver] = useState(null);

  const confirmFn = useCallback(() => {
    return new Promise((resolve) => {
      setModalOpen(true);
      setResolver(() => resolve);
    });
  }, []);

  useNavigationPrompt(when, confirmFn);

  const handleConfirm = () => {
    setModalOpen(false);
    resolver?.(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    resolver?.(false);
  };

  return { isModalOpen, handleConfirm, handleCancel };
}
