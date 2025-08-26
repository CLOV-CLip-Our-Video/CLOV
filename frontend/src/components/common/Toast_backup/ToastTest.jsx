/* eslint-disable */
import React, { useState } from 'react';
import Toast from './Toast';

/**
 * Toast 컴포넌트 테스트용 컴포넌트
 */
const ToastTest = () => {
  const [toasts, setToasts] = useState([]);

  // 더미 토스트 생성 함수들
  const addDummyToast = (type) => {
    const messages = {
      success: '성공적으로 처리되었습니다!',
      error: '오류가 발생했습니다.',
      warning: '주의가 필요합니다.',
      info: '정보를 확인해주세요.',
    };

    const newToast = {
      id: Date.now() + Math.random(),
      type,
      message: messages[type],
      duration: 3000,
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className='p-8'>
      <h2
        className='text-xl font-bold mb-4'
        style={{ color: 'var(--color-text)' }}
      >
        Toast 컴포넌트 테스트
      </h2>

      <div className='flex gap-2 mb-4'>
        <button
          className='px-4 py-2 rounded text-white'
          style={{ backgroundColor: 'var(--color-success)' }}
          onClick={() => addDummyToast('success')}
        >
          성공 토스트
        </button>

        <button
          className='px-4 py-2 rounded text-white'
          style={{ backgroundColor: 'var(--color-error)' }}
          onClick={() => addDummyToast('error')}
        >
          에러 토스트
        </button>

        <button
          className='px-4 py-2 rounded text-white'
          style={{ backgroundColor: 'var(--color-warning)' }}
          onClick={() => addDummyToast('warning')}
        >
          경고 토스트
        </button>

        <button
          className='px-4 py-2 rounded text-white'
          style={{ backgroundColor: 'var(--color-info)' }}
          onClick={() => addDummyToast('info')}
        >
          정보 토스트
        </button>
      </div>

      <div className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
        현재 토스트 개수: {toasts.length}
      </div>

      {/* Toast 컴포넌트 */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ToastTest;
