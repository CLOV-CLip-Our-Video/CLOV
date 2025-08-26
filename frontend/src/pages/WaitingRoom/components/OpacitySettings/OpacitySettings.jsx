/* eslint-disable */
import React, { useEffect } from 'react';
import styles from './OpacitySettings.module.css';
import SliderBar from '../../../../components/common/SliderBar/SliderBar';
import useCameraStore from '../../../../stores/cameraStore';

const OpacitySettings = () => {
  const { transparency, setTransparency } = useCameraStore();

  // 컴포넌트 마운트 시 투명도를 100(불투명)으로 초기화
  useEffect(() => {
    setTransparency(100);
  }, []);

  return (
    <div className={styles.settingCard}>
      <h3 className={styles.cardTitle}>투명도</h3>
      <p className={styles.cardDescription}>
        캔버스 투명도를 조절하면 RecordingRoom에서 배경이 비쳐보입니다
      </p>

      {/* 투명도 슬라이더 */}
      <div className={styles.sliderSection}>
        <div className={styles.sliderHeader}>
          {/* <span className={styles.sliderLabel}>투명도</span> */}
          {/* <span className={styles.sliderValue}>{transparency}%</span> */}
        </div>
        <SliderBar
          min={0}
          max={100}
          value={transparency}
          onChange={(e) => setTransparency(parseInt(e.target.value))}
          className={styles.sliderValue}
        />
        <div className={styles.sliderPresets}>
          <button
            onClick={() => setTransparency(100)}
            className={`${styles.preset} ${transparency === 100 ? styles.active : ''}`}
          >
            불투명
          </button>
          <button
            onClick={() => setTransparency(60)}
            className={`${styles.preset} ${transparency === 60 ? styles.active : ''}`}
          >
            반투명
          </button>
          <button
            onClick={() => setTransparency(30)}
            className={`${styles.preset} ${transparency === 30 ? styles.active : ''}`}
          >
            유령
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpacitySettings;