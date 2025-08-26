// 터치 제스처 관련 상수들
export const TOUCH_CONSTANTS = {
  // 제스처 감지 임계값 (모바일 최적화)
  PINCH_THRESHOLD: 15, // 핀치 감지를 위한 최소 거리 변화 (px) - 더 관대하게
  ROTATION_THRESHOLD: 3, // 회전 감지를 위한 최소 각도 변화 (도) - 더 민감하게
  MOVE_THRESHOLD: 8, // 이동 감지를 위한 최소 거리 (px) - 약간 증가

  // 스케일 제한
  MIN_SCALE: 0.5, // 최소 스케일
  MAX_SCALE: 2.0, // 최대 스케일
  SCALE_SENSITIVITY: 0.015, // 핀치 감도 (거리당 스케일 변화율) - 약간 증가

  // 회전 제한
  ROTATION_SENSITIVITY: 1.2, // 회전 감도 (각도 변화율) - 더 민감하게

  // 제스처 타입
  GESTURE_TYPES: {
    NONE: 'none',
    MOVE: 'move',
    PINCH: 'pinch',
    ROTATE: 'rotate',
  },

  // 터치 상태
  TOUCH_STATES: {
    IDLE: 'idle',
    SINGLE_TOUCH: 'single_touch',
    MULTI_TOUCH: 'multi_touch',
  },

  // 디바운싱
  GESTURE_DEBOUNCE_TIME: 50, // ms
};

// 기본 캠 크기 (기존 캠 크기와 일치)
export const DEFAULT_CAM_SIZE = {
  WIDTH: 160,
  HEIGHT: 120,
  ASPECT_RATIO: 160 / 120, // 4:3
};
