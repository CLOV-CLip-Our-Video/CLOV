/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

/**
 * 확장성과 접근성을 고려한 Modal 컴포넌트
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  footer,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
}) {
  const modalRef = useRef(null);

  // 포커스 설정
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // ESC 전역 이벤트
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // body 스크롤 락
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 백드롭 클릭 핸들러
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // 크기 클래스
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'min-w-[300px] max-w-md';
      case 'large':
        return 'min-w-[600px] max-w-4xl w-full mx-4';
      case 'xlarge':
        return 'min-w-[800px] max-w-6xl w-full mx-4';
      case 'medium':
      default:
        return 'min-w-[400px] max-w-2xl';
    }
  };

  // 클래스 병합
  // 배경색은 bg-black/원하는 비율 로 접근해야함
  // bg-black bg-opacity-50 이런식으로 하면 안댐
  const overlayClasses = twMerge(
    'fixed inset-0 bg-black/60 flex items-center justify-center p-4',
    overlayClassName
  );

  // z-index를 더 높게 설정 (BottomSheet, MobileControls보다 높게)
  const overlayStyle = {
    zIndex: 1500
  };

  const containerClasses = twMerge(
    'bg-white rounded shadow-md relative',
    'bg-[var(--color-card-background)]',
    'rounded-[var(--border-radius-large)]',
    'shadow-[var(--shadow-modal)]',
    getSizeClass(),
    'max-h-[90vh] overflow-auto focus:outline-none',
    className
  );

  const titleId = title ? 'modal-title' : undefined;

  return createPortal(
    // 여기 빨간줄 무시해도 됩니다
    <div
      ref={modalRef}
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      tabIndex={0}
      onClick={handleBackdropClick}
      className={overlayClasses}
      style={overlayStyle}
    >
      <div
        role='presentation'
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={containerClasses}
      >
        {/* Header */}
        {title && (
          <div className='flex items-center justify-between px-6 py-4 border-b border-[var(--border-color-default)]'>
            <h2
              id={titleId}
              className='text-xl font-bold text-[var(--color-text)] m-0'
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label='Close modal'
                className='text-[var(--color-text-light)] hover:text-[var(--color-text)] w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200'
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Close button (title 없을 경우) */}
        {!title && showCloseButton && (
          <button
            onClick={onClose}
            aria-label='Close modal'
            className='absolute top-3 right-4 text-gray-500 hover:text-black z-10'
          >
            ✕
          </button>
        )}

        {/* Content */}
        <div className='p-6'>
          {children ?? <p className='text-gray-400'>내용이 없습니다</p>}
        </div>

        {/* Footer */}
        {footer && (
          <div className='px-6 py-4 border-t border-[var(--border-color-default)] bg-[var(--color-background)]'>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
