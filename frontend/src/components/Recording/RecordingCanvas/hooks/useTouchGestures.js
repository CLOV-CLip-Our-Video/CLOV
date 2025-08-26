// 터치 제스처 처리 훅
import { useRef, useCallback } from 'react';
import { TOUCH_CONSTANTS, DEFAULT_CAM_SIZE } from '../constants/touchConstants';
import {
  getTouchCanvasCoordinates,
  isTouchInArea,
} from '../utils/touchEventUtils';
import {
  detectGestureType,
  calculateScaleChange,
  calculateRotationChange,
  initializeTouchState,
  updateTouchState,
} from '../utils/gestureRecognition';

/**
 * 터치 제스처 처리 훅
 * @param {Object} params - 파라미터
 * @param {Object} params.myStyle - 현재 캠 스타일 (x, y, scale, rotation)
 * @param {Function} params.updateMyState - 상태 업데이트 함수
 * @param {Function} params.updateMyPosition - 위치 업데이트 함수
 * @param {Function} params.updateMyRotation - 회전 업데이트 함수
 * @param {boolean} params.isCountingDown - 카운트다운 중인지 여부
 * @returns {Object} 터치 이벤트 핸들러들
 */
export const useTouchGestures = ({
  myStyle,
  updateMyState,
  updateMyPosition,
  updateMyRotation,
  isCountingDown,
}) => {
  const touchStateRef = useRef({
    isActive: false,
    gestureType: TOUCH_CONSTANTS.GESTURE_TYPES.NONE,
    touchData: null,
    dragOffset: { x: 0, y: 0 }, // 드래그 시작점과 캠 위치 차이
  });

  const handleTouchStart = useCallback(
    (e) => {
      if (isCountingDown) return;

      e.preventDefault();
      const canvas = e.currentTarget;
      const touches = e.touches;

      if (touches.length === 0) return;

      // 두 손가락 이상이면 캔버스 전체에서 제스처 허용
      if (touches.length >= 2) {
        // 멀티터치는 캔버스 어디서나 허용
        const initialState = initializeTouchState(touches);
        touchStateRef.current = {
          isActive: true,
          gestureType: initialState.gestureType,
          touchData: initialState,
          dragOffset: { x: 0, y: 0 },
        };
        return;
      }

      // 단일 터치는 캠 영역 내부에서만 허용 (기존 로직 유지)
      const firstTouch = touches[0];
      const { x: myX, y: myY, scale } = myStyle;
      const width = DEFAULT_CAM_SIZE.WIDTH * scale;
      const height = DEFAULT_CAM_SIZE.HEIGHT * scale;

      const isInCam = isTouchInArea(firstTouch, canvas, {
        x: myX,
        y: myY,
        width,
        height,
      });

      if (!isInCam) return;

      // 터치 상태 초기화
      const initialState = initializeTouchState(touches);
      touchStateRef.current = {
        isActive: true,
        gestureType: initialState.gestureType,
        touchData: initialState,
        dragOffset: { x: 0, y: 0 },
      };

      // 드래그 오프셋 계산 (단일 터치인 경우)
      if (touches.length === 1) {
        const touchCoords = getTouchCanvasCoordinates(firstTouch, canvas);
        touchStateRef.current.dragOffset = {
          x: touchCoords.x - myX,
          y: touchCoords.y - myY,
        };
      }
    },
    [myStyle, isCountingDown]
  );

  const handleTouchMove = useCallback(
    (e) => {
      // 카운트다운 중이거나 터치 상태가 없으면 처리하지 않음
      if (isCountingDown || !touchStateRef.current.isActive) return;
      e.preventDefault();
      const canvas = e.currentTarget;
      const touches = e.touches;

      // 터치가 없으면 처리하지 않음
      if (touches.length === 0) return;

      // 터치 상태 업데이트
      const newTouchData = updateTouchState(
        touches,
        touchStateRef.current.touchData
      );
      const gestureType = detectGestureType(
        touches,
        touchStateRef.current.touchData
      );

      touchStateRef.current.gestureType = gestureType;
      touchStateRef.current.touchData = newTouchData;

      // 제스처 타입별 처리
      switch (gestureType) {
        case TOUCH_CONSTANTS.GESTURE_TYPES.MOVE: {
          // 단일 터치 - 이동
          if (touches.length === 1) {
            const touchCoords = getTouchCanvasCoordinates(touches[0], canvas);
            const newX = touchCoords.x - touchStateRef.current.dragOffset.x;
            const newY = touchCoords.y - touchStateRef.current.dragOffset.y;
            const { scale } = myStyle;
            const width = DEFAULT_CAM_SIZE.WIDTH * scale;
            const height = DEFAULT_CAM_SIZE.HEIGHT * scale;

            // 캔버스 경계 내로 제한
            const boundedX = Math.max(0, Math.min(newX, canvas.width - width));
            const boundedY = Math.max(
              0,
              Math.min(newY, canvas.height - height)
            );

            // 위치 업데이트
            updateMyPosition({
              x: boundedX,
              y: boundedY,
            });
          }
          break;
        }

        case TOUCH_CONSTANTS.GESTURE_TYPES.PINCH: {
          // 두 터치 - 핀치 확대/축소 (캔버스 전체에서 작동)
          if (
            touches.length === 2 &&
            touchStateRef.current.touchData.twoTouchData
          ) {
            const prevData = touchStateRef.current.touchData.twoTouchData;
            const currentDistance = newTouchData.twoTouchData.distance;
            // 이전 거리가 0이 아니면 스케일 변화 계산
            if (prevData.distance > 0) {
              const scaleChange = calculateScaleChange(
                currentDistance,
                prevData.distance
              );
              const currentScale = myStyle.scale || 1.0;
              let newScale = currentScale * scaleChange;
              // 스케일 제한
              newScale = Math.max(
                TOUCH_CONSTANTS.MIN_SCALE,
                Math.min(TOUCH_CONSTANTS.MAX_SCALE, newScale)
              );
              if (Math.abs(newScale - currentScale) > 0.01) {
                // 미세한 변화는 무시
                // 중심점 유지를 위한 위치 보정
                const oldWidth = DEFAULT_CAM_SIZE.WIDTH * currentScale;
                const oldHeight = DEFAULT_CAM_SIZE.HEIGHT * currentScale;
                const newWidth = DEFAULT_CAM_SIZE.WIDTH * newScale;
                const newHeight = DEFAULT_CAM_SIZE.HEIGHT * newScale;
                // 중심점 위치 계산
                const centerX = myStyle.x + oldWidth / 2;
                const centerY = myStyle.y + oldHeight / 2;
                const newX = centerX - newWidth / 2;
                const newY = centerY - newHeight / 2;

                // 캔버스 경계 내로 제한
                const boundedX = Math.max(
                  0,
                  Math.min(newX, canvas.width - newWidth)
                );
                const boundedY = Math.max(
                  0,
                  Math.min(newY, canvas.height - newHeight)
                );

                // 위치 업데이트
                updateMyState({
                  x: boundedX,
                  y: boundedY,
                  scale: newScale,
                });
              }
            }
          }
          break;
        }

        case TOUCH_CONSTANTS.GESTURE_TYPES.ROTATE: {
          // 두 터치 - 회전 (캔버스 전체에서 작동)
          if (
            touches.length === 2 &&
            touchStateRef.current.touchData.twoTouchData
          ) {
            const prevData = touchStateRef.current.touchData.twoTouchData;
            const currentAngle = newTouchData.twoTouchData.angle;
            // 각도 변화량 계산
            const rotationChange = calculateRotationChange(
              currentAngle,
              prevData.angle
            );
            // 각도 변화량이 임계값을 넘으면 회전 업데이트
            if (Math.abs(rotationChange) > 0.5) {
              // 더 작은 변화도 감지
              const currentRotation = myStyle.rotation || 0;
              let newRotation = currentRotation + rotationChange;
              // 0-359도 범위로 정규화
              newRotation = ((newRotation % 360) + 360) % 360;
              updateMyRotation(newRotation);
            }
          }
          break;
        }

        default:
          break;
      }
    },
    [myStyle, updateMyState, updateMyPosition, updateMyRotation, isCountingDown]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      e.preventDefault();
      // 터치가 모두 끝났으면 상태 초기화
      if (e.touches.length === 0) {
        touchStateRef.current = {
          isActive: false,
          gestureType: TOUCH_CONSTANTS.GESTURE_TYPES.NONE,
          touchData: null,
          dragOffset: { x: 0, y: 0 },
        };
      } else if (e.touches.length === 1) {
        // 두 터치에서 한 터치로 변경된 경우, 단일 터치 이동으로 전환
        const remainingTouch = e.touches[0];
        const { x: myX, y: myY, scale } = myStyle;
        const width = DEFAULT_CAM_SIZE.WIDTH * scale;
        const height = DEFAULT_CAM_SIZE.HEIGHT * scale;

        // 남은 터치가 캠 영역 내부인지 확인
        const canvas = e.currentTarget;
        const isInCam = isTouchInArea(remainingTouch, canvas, {
          x: myX,
          y: myY,
          width,
          height,
        });

        if (isInCam) {
          // 캠 영역 내부면 이동 모드로 전환
          const touchCoords = getTouchCanvasCoordinates(remainingTouch, canvas);
          const newTouchData = initializeTouchState(e.touches);
          touchStateRef.current = {
            isActive: true,
            gestureType: TOUCH_CONSTANTS.GESTURE_TYPES.MOVE,
            touchData: newTouchData,
            dragOffset: {
              x: touchCoords.x - myX,
              y: touchCoords.y - myY,
            },
          };
        } else {
          // 캠 영역 외부면 제스처 종료
          touchStateRef.current = {
            isActive: false,
            gestureType: TOUCH_CONSTANTS.GESTURE_TYPES.NONE,
            touchData: null,
            dragOffset: { x: 0, y: 0 },
          };
        }
      } else {
        // 여전히 멀티터치인 경우 상태 업데이트
        const newTouchData = initializeTouchState(e.touches);
        touchStateRef.current.touchData = newTouchData;
        touchStateRef.current.gestureType = newTouchData.gestureType;
      }
    },
    [myStyle]
  );

  const handleTouchCancel = useCallback((e) => {
    e.preventDefault();

    // 터치 취소시 상태 완전 초기화
    touchStateRef.current = {
      isActive: false,
      gestureType: TOUCH_CONSTANTS.GESTURE_TYPES.NONE,
      touchData: null,
      dragOffset: { x: 0, y: 0 },
    };
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    touchState: touchStateRef.current,
  };
};
