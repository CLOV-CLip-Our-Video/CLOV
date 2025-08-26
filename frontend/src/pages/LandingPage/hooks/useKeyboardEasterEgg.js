import { useEffect } from 'react';

export const useKeyboardEasterEgg = (onSpacePress, onShiftSpacePress) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 디버깅용 로그
      if (e.code === 'Space' || e.key === ' ') {
        // Shift+Space 조합 확인
        if (e.shiftKey) {
          e.preventDefault();
          onShiftSpacePress();
        } else {
          e.preventDefault();
          onSpacePress();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSpacePress, onShiftSpacePress]);
};
