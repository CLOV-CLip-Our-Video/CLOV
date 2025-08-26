import { useState, useEffect } from 'react';

// Breakpoints
const BREAKPOINTS = {
  MOBILE: 768,
  // TABLET: 1024,
};

/**
 * 뷰포트 크기와 디바이스 타입을 감지하는 훅
 * @returns {Object} viewport 정보
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isPortrait: false,
    isLandscape: false,
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < BREAKPOINTS.MOBILE;
      // const isTablet = width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET;
      const isDesktop = width >= BREAKPOINTS.MOBILE;
      const isPortrait = height > width;
      const isLandscape = width > height;

      setViewport({
        width,
        height,
        isMobile,
        // isTablet,
        isDesktop,
        isPortrait,
        isLandscape,
      });
    };

    // 초기 설정
    updateViewport();

    // 리사이즈 및 방향 변경 이벤트 리스너
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
};

export default useViewport;
