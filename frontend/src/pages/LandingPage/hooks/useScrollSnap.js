/* eslint-disable */
import { useEffect, useRef, useCallback } from 'react';

export const useScrollSnap = () => {
  const containerRef = useRef(null);

  // iOS/WebKit 감지
  const isIOS = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }, []);

  // 실제 뷰포트 높이 계산 (iOS 주소창 문제 해결)
  const getViewportHeight = useCallback(() => {
    if (isIOS()) {
      return document.documentElement.clientHeight || window.innerHeight;
    }
    return window.innerHeight;
  }, [isIOS]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTouchY = 0;

    const snapToSection = (targetSection) => {
      if (isScrolling) return;
      
      isScrolling = true;
      const viewportHeight = getViewportHeight();
      const targetScrollTop = targetSection * viewportHeight;
      
      // iOS에서 부드러운 애니메이션을 위해 requestAnimationFrame 사용
      if (isIOS()) {
        let startScrollTop = container.scrollTop;
        let startTime = performance.now();
        const duration = 600; // iOS에서 더 긴 애니메이션
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // easeInOutCubic 이징 함수
          const easeProgress = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          const currentScrollTop = startScrollTop + (targetScrollTop - startScrollTop) * easeProgress;
          container.scrollTop = currentScrollTop;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            isScrolling = false;
          }
        };
        
        requestAnimationFrame(animate);
      } else {
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
        
        setTimeout(() => {
          isScrolling = false;
        }, 800);
      }
    };

    // iOS 전용 터치 이벤트 핸들러
    const handleTouchStart = (e) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }
      
      touchStartY = e.touches[0].clientY;
      lastTouchY = touchStartY;
      touchStartTime = performance.now();
    };

    const handleTouchMove = (e) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }
      
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }

      const touchEndY = lastTouchY;
      const touchDuration = performance.now() - touchStartTime;
      const touchDistance = touchStartY - touchEndY;
      const viewportHeight = getViewportHeight();
      const currentSection = Math.round(container.scrollTop / viewportHeight);
      
      // 터치 임계값 (iOS는 더 큰 값 사용)
      const minDistance = 50;
      const maxDuration = 300; // 빠른 플릭 감지
      
      let shouldSnap = false;
      let targetSection = currentSection;
      
      // 빠른 플릭이거나 충분한 거리를 움직인 경우
      if (Math.abs(touchDistance) > minDistance || touchDuration < maxDuration) {
        if (touchDistance > 0) {
          // 위로 스와이프 -> 다음 섹션
          targetSection = Math.min(1, currentSection + 1);
          shouldSnap = true;
        } else if (touchDistance < 0) {
          // 아래로 스와이프 -> 이전 섹션
          targetSection = Math.max(0, currentSection - 1);
          shouldSnap = true;
        }
      }
      
      if (shouldSnap && targetSection !== currentSection) {
        e.preventDefault();
        snapToSection(targetSection);
      } else {
        // 원래 섹션으로 되돌리기
        snapToSection(currentSection);
      }
    };

    // 데스크톱용 휠 이벤트 핸들러
    const handleWheel = (e) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }

      const viewportHeight = getViewportHeight();
      const currentSection = Math.round(container.scrollTop / viewportHeight);
      const deltaY = e.deltaY;
      
      // 휠 방향에 따라 다음/이전 섹션으로 이동
      const nextSection = deltaY > 0 ? Math.min(1, currentSection + 1) : Math.max(0, currentSection - 1);
      
      if (nextSection !== currentSection) {
        e.preventDefault();
        snapToSection(nextSection);
      }
    };

    // iOS인지 데스크톱인지에 따라 다른 이벤트 리스너 등록
    if (isIOS()) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    } else {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (isIOS()) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      } else {
        container.removeEventListener('wheel', handleWheel);
      }
      clearTimeout(scrollTimeout);
    };
  }, [isIOS, getViewportHeight]);

  return containerRef;
};