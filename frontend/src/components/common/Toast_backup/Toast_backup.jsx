/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styles from './Toast.module.css';

/**
 * 개별 토스트 메시지 컴포넌트
 */
const ToastItem = ({
  id,
  type = 'info',
  message,
  duration = 3000,
  onRemove,
  isVisible = false,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      default:
        return styles.info;
    }
  };

  return (
    <div
      className={`${styles.toastItem} ${getTypeClasses()} ${isVisible ? styles.visible : ''}
                     flex items-center gap-3 p-3 rounded-lg shadow-lg mb-2`}
    >
      <span className='text-lg flex-shrink-0'>{getIcon()}</span>
      <span className='flex-1 text-sm font-medium'>{message}</span>
      <button
        className={`${styles.closeButton} w-6 h-6 flex items-center justify-center rounded-full text-xs cursor-pointer border-none`}
        onClick={() => onRemove(id)}
      >
        ✕
      </button>
    </div>
  );
};

/**
 * 토스트 컨테이너 컴포넌트
 */
const ToastContainer = ({ toasts = [], removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className={`${styles.container} fixed top-4 right-4 z-50 max-w-sm w-full`}
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onRemove={removeToast}
          isVisible={true}
        />
      ))}
    </div>
  );
};

/**
 * 토스트 훅 - 토스트 관리를 위한 커스텀 훅
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message, duration) =>
    addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) =>
    addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

/**
 * 메인 Toast 컴포넌트 (ToastContainer와 동일)
 */
const Toast = ({ toasts, removeToast }) => {
  return <ToastContainer toasts={toasts} removeToast={removeToast} />;
};

export default Toast;
