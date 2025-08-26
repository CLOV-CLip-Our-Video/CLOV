/* eslint-disable */
import React from 'react';
import styles from './SliderBar.module.css';

/**
 * 재사용 가능한 슬라이더 컴포넌트
 *
 * @param {number} min - 최솟값
 * @param {number} max - 최댓값
 * @param {number} step - 단계값
 * @param {number} value - 현재값
 * @param {function} onChange - 값 변경 핸들러
 * @param {string} label - 라벨 텍스트
 * @param {string} unit - 단위 (기본값: '%')
 * @param {string} className - 추가 CSS 클래스
 */
const SliderBar = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  unit = '%',
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`${styles.container} ${className}`}>
      <label className={styles.label}>
        {label}: {value}
        {unit}
      </label>

      <div className={styles.sliderWrapper}>
        {/* 배경 트랙 */}
        <div
          className={styles.track}
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-input-border) ${percentage}%, var(--color-input-border) 100%)`,
          }}
        />

        {/* 실제 input range */}
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className={styles.slider}
        />
      </div>
    </div>
  );
};

export default SliderBar;
