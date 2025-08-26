// 터치 제스처 인식 로직
import { TOUCH_CONSTANTS } from '../constants/touchConstants';
import {
  calculateTouchDistance,
  calculateTouchAngle,
  radiansToDegrees,
} from './touchEventUtils';

/**
 * 제스처 타입 감지
 * @param {TouchList} touches - 현재 터치 리스트
 * @param {Object} previousState - 이전 터치 상태
 * @returns {string} 제스처 타입
 */
export const detectGestureType = (touches, previousState) => {
  // 터치가 없으면 제스처 없음
  if (touches.length === 0) {
    return TOUCH_CONSTANTS.GESTURE_TYPES.NONE;
  }
  // 단일 터치는 이동 제스처로 간주
  if (touches.length === 1) {
    return TOUCH_CONSTANTS.GESTURE_TYPES.MOVE;
  }
  // 두 터치는 핀치 또는 회전 제스처로 간주
  if (touches.length === 2) {
    // 이전 상태가 없으면 멀티터치 시작으로 간주
    if (!previousState || !previousState.twoTouchData) {
      return TOUCH_CONSTANTS.GESTURE_TYPES.PINCH;
    }
    // 터치 간 거리와 각도 계산
    const currentDistance = calculateTouchDistance(touches[0], touches[1]);
    const currentAngle = calculateTouchAngle(touches[0], touches[1]);
    // 이전 상태의 거리와 각도 가져오기
    const prevDistance = previousState.twoTouchData.distance;
    const prevAngle = previousState.twoTouchData.angle;
    // 거리와 각도 변화량 계산
    const distanceChange = Math.abs(currentDistance - prevDistance);
    const angleChange = Math.abs(radiansToDegrees(currentAngle - prevAngle));

    // 거리 변화량 정규화 (픽셀 → 비율)
    const normalizedDistanceChange = distanceChange / prevDistance;

    // 개선된 제스처 우선순위 결정
    if (distanceChange > TOUCH_CONSTANTS.PINCH_THRESHOLD) {
      if (angleChange > TOUCH_CONSTANTS.ROTATION_THRESHOLD) {
        // 둘 다 임계값을 넘으면 상대적 변화량으로 결정
        // 각도 변화가 상대적으로 크거나, 거리 변화가 매우 작으면 회전 우선
        if (angleChange > 8 || normalizedDistanceChange < 0.05) {
          return TOUCH_CONSTANTS.GESTURE_TYPES.ROTATE;
        }
        // 거리 변화가 상대적으로 크면 핀치 우선
        return TOUCH_CONSTANTS.GESTURE_TYPES.PINCH;
      }
      return TOUCH_CONSTANTS.GESTURE_TYPES.PINCH;
    }
    // 각도 변화가 임계값을 넘으면 회전 제스처로 간주
    if (angleChange > TOUCH_CONSTANTS.ROTATION_THRESHOLD) {
      return TOUCH_CONSTANTS.GESTURE_TYPES.ROTATE;
    }
    // 변화가 작으면 이전 제스처 유지 (단, 초기값은 핀치)
    return previousState.gestureType || TOUCH_CONSTANTS.GESTURE_TYPES.PINCH;
  }

  // 3개 이상 터치는 무시
  return TOUCH_CONSTANTS.GESTURE_TYPES.NONE;
};

/**
 * 스케일 변화량 계산
 * @param {number} currentDistance - 현재 두 터치 간 거리
 * @param {number} previousDistance - 이전 두 터치 간 거리
 * @returns {number} 스케일 변화량
 */
export const calculateScaleChange = (currentDistance, previousDistance) => {
  // 이전 거리가 0이면 1로 설정
  if (previousDistance === 0 || previousDistance < 10) return 1;
  const ratio = currentDistance / previousDistance;
  // 급격한 변화 방지 (모바일에서 더 부드럽게)
  return Math.max(0.9, Math.min(1.1, ratio));
};

/**
 * 회전 각도 변화량 계산
 * @param {number} currentAngle - 현재 각도 (라디안)
 * @param {number} previousAngle - 이전 각도 (라디안)
 * @returns {number} 각도 변화량 (도)
 */
export const calculateRotationChange = (currentAngle, previousAngle) => {
  let angleDiff = currentAngle - previousAngle;
  // 각도 차이를 -180도에서 180도 사이로 정규화
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
  // 각도 변화량 계산
  return radiansToDegrees(angleDiff) * TOUCH_CONSTANTS.ROTATION_SENSITIVITY;
};

/**
 * 터치 상태 초기화
 * @param {TouchList} touches - 터치 리스트
 * @returns {Object} 초기 터치 상태
 */
export const initializeTouchState = (touches) => {
  const state = {
    touchCount: touches.length,
    gestureType: TOUCH_CONSTANTS.GESTURE_TYPES.NONE,
    timestamp: Date.now(),
  };
  // 단일 터치 데이터 초기화
  if (touches.length === 1) {
    state.singleTouchData = {
      startX: touches[0].clientX,
      startY: touches[0].clientY,
      currentX: touches[0].clientX,
      currentY: touches[0].clientY,
    };
  }
  // 두 터치 데이터 초기화
  if (touches.length === 2) {
    state.twoTouchData = {
      distance: calculateTouchDistance(touches[0], touches[1]),
      angle: calculateTouchAngle(touches[0], touches[1]),
      centerX: (touches[0].clientX + touches[1].clientX) / 2,
      centerY: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }
  return state;
};

/**
 * 터치 상태 업데이트
 * @param {TouchList} touches - 현재 터치 리스트
 * @param {Object} previousState - 이전 터치 상태
 * @returns {Object} 업데이트된 터치 상태
 */
export const updateTouchState = (touches, previousState) => {
  const newState = {
    ...previousState,
    touchCount: touches.length,
    timestamp: Date.now(),
  };
  // 제스처 타입 감지
  newState.gestureType = detectGestureType(touches, previousState);
  // 단일 터치 데이터 업데이트
  if (touches.length === 1) {
    newState.singleTouchData = {
      ...(previousState.singleTouchData || {}),
      currentX: touches[0].clientX,
      currentY: touches[0].clientY,
    };
    // 시작점이 없으면 현재 위치로 설정
    if (!newState.singleTouchData.startX) {
      newState.singleTouchData.startX = touches[0].clientX;
      newState.singleTouchData.startY = touches[0].clientY;
    }
  }
  // 두 터치 데이터 업데이트
  if (touches.length === 2) {
    newState.twoTouchData = {
      distance: calculateTouchDistance(touches[0], touches[1]),
      angle: calculateTouchAngle(touches[0], touches[1]),
      centerX: (touches[0].clientX + touches[1].clientX) / 2,
      centerY: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }
  return newState;
};
