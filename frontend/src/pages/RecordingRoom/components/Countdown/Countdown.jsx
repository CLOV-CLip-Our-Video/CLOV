// src/components/Recording/Countdown/Countdown.jsx
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';

/**
 * Countdown 컴포넌트
 * @param {number} duration - 카운트다운 시작 숫자 (기본: 3)
 * @param {function} onComplete - 카운트 완료 후 호출될 콜백
 */
export default function Countdown({ duration = 3, onComplete }) {
  const [count, setCount] = useState(duration);
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    if (count <= 0) {
      setShowStart(true);

      const timer = setTimeout(() => {
        setShowStart(false);
        onComplete?.();
      }, 800); // "시작!" 보여주고 콜백

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none select-none'>
      <div
        className='text-white text-7xl font-extrabold animate-countdown'
        key={showStart ? 'start' : count}
      >
        {showStart ? '시작!' : count}
      </div>
    </div>
  );
}
