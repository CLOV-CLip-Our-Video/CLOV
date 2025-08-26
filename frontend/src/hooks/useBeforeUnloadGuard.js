// hooks/useBeforeUnloadGuard.js
import { useEffect } from 'react';

/**
 * 새로고침 / 브라우저 닫기 방지 후 사용자에게 브라우저 confirm 띄움
 */
export function useBeforeUnloadGuard(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);
}
