// hooks/useNavigationPrompt.js
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBeforeUnloadGuard } from './useBeforeUnloadGuard';

/**
 * React Router v7용 라우팅 차단 훅
 * @param {boolean} when - 차단 조건
 * @param {() => Promise<boolean>} confirmFn - 사용자 확인 함수
 */
export function useNavigationPrompt(when, confirmFn) {
  const navigate = useNavigate();
  const location = useLocation();

  useBeforeUnloadGuard(when);

  useEffect(() => {
    if (!when) return;

    // 최초 진입 시 현재 경로로 pushState 고정 (뒤로가기 방지용)
    window.history.pushState(null, '', window.location.pathname);

    const handlePopState = async (e) => {
      const confirmed = await confirmFn();
      if (!confirmed) {
        navigate(location.pathname, { replace: true });
        window.history.pushState(null, '', location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [when, confirmFn, location.pathname, navigate]);
}
