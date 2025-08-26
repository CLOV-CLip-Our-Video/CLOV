import React from 'react';
import styles from './SegmentationModeSelector.module.css';
import useCameraStore from '../../../../stores/cameraStore';

const SegmentationModeSelector = () => {
  const { cameraMode, setCameraMode } = useCameraStore();

  // 모드 매핑 (숫자 -> 문자열)
  const modeMap = {
    1: 'original',
    2: 'person',
    3: 'face',
  };

  // 현재 세그멘테이션 모드
  const segmentationMode = modeMap[cameraMode] || 'original';

  // 세그멘테이션 모드 변경
  const handleSegmentationModeChange = (modeString) => {
    const modeNumberMap = {
      original: 1,
      person: 2,
      face: 3,
    };
    const modeNumber = modeNumberMap[modeString];
    setCameraMode(modeNumber);
    // /* console.log('🎭 누끼 모드 변경:', modeString, '(', modeNumber, ')'); */
  };

  const modes = [
    { id: 'original', name: '원본', icon: '📷', desc: '원본 영상입니다.' },
    {
      id: 'person',
      name: '사람',
      icon: '👤',
      desc: '사람을 제외한 배경이 제거됩니다.',
    },
    // {
    //   id: 'face',
    //   name: '얼굴',
    //   icon: '😀',
    //   desc: '얼굴만 제외한 배경이 제거됩니다.(주의: 2명 이상 촬영 시 정상 작동하지 않을 수 있습니다.)',
    // },
  ];

  return (
    <div className={styles.settingCard}>
      <h3 className={styles.cardTitle}>배경 제거</h3>
      <div className={styles.segmentationModes}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleSegmentationModeChange(mode.id)}
            className={`${styles.modeButton} ${segmentationMode === mode.id ? styles.active : ''}`}
          >
            <span className={styles.modeIcon}>{mode.icon}</span>
            <div className={styles.modeInfo}>
              <span className={styles.modeName}>{mode.name}</span>
              <span className={styles.modeDesc}>{mode.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SegmentationModeSelector;
