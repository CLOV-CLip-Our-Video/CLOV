import toast from 'react-hot-toast';

/**
 * @typedef {'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'} ToastPosition
 */

/**
 * 글로벌 toast 유틸
 *
 * @param {'success' | 'error' | 'info' | 'custom'} type
 * @param {string|React.ReactNode} message
 * @param {Object} options
 * @param {string} [options.id]
 * @param {string} [options.icon]
 * @param {number} [options.duration]
 * @param {ToastPosition} [options.position] - 자동완성만 제공됨
 * @param {Object} [options.style]
 * @param {string} [options.className]
 */
export function showToast(type, message, options = {}) {
  const config = {
    ...options,
    duration: options.duration ?? 3000,
    position: options.position ?? 'top-center',
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  };

  switch (type) {
    case 'success':
      toast.success(message, config);
      break;
    case 'error':
      toast.error(message, config);
      break;
    case 'custom':
      toast.custom(message, config);
      break;
    case 'info':
    default:
      toast(message, config);
  }
}

// 사용 예시 (import 경로는 실제 위치에 맞게 조정)
/*
import { showToast } from '@/components/common/Toast/toast';

showToast('success', '복사되었습니다!', {
  icon: '📋',
  position: 'bottom-right',
});

showToast('error', '카메라 권한이 없습니다.', {
  icon: '🚫',
  duration: 5000,
  style: {
    background: '#fee2e2',
    color: '#991b1b',
  },
});

showToast('info', '녹화가 곧 시작됩니다', {
  position: 'top-center',
});

showToast('custom', <div className='p-3 text-sm'>🧪 커스텀 UI 가능</div>);
*/
