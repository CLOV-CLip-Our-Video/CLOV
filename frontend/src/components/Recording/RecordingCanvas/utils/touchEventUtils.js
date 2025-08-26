// 터치 이벤트 처리를 위한 유틸리티 함수들

/**
 * 터치 이벤트에서 캔버스 좌표로 변환
 * @param {Touch} touch - 터치 객체
 * @param {HTMLCanvasElement} canvas - 캔버스 엘리먼트
 * @returns {Object} { x, y } 캔버스 내 좌표
 */
export const getTouchCanvasCoordinates = (touch, canvas) => {
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: x * scaleX,
    y: y * scaleY,
  };
};

/**
 * 두 터치 포인트 간의 거리 계산
 * @param {Touch} touch1 - 첫 번째 터치
 * @param {Touch} touch2 - 두 번째 터치
 * @returns {number} 두 점 간의 거리
 */
export const calculateTouchDistance = (touch1, touch2) => {
  const deltaX = touch2.clientX - touch1.clientX;
  const deltaY = touch2.clientY - touch1.clientY;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

/**
 * 두 터치 포인트 간의 각도 계산 (라디안)
 * @param {Touch} touch1 - 첫 번째 터치 (기준점)
 * @param {Touch} touch2 - 두 번째 터치
 * @returns {number} 라디안 단위 각도
 */
export const calculateTouchAngle = (touch1, touch2) => {
  const deltaX = touch2.clientX - touch1.clientX;
  const deltaY = touch2.clientY - touch1.clientY;
  return Math.atan2(deltaY, deltaX);
};

/**
 * 두 터치 포인트의 중심점 계산
 * @param {Touch} touch1 - 첫 번째 터치
 * @param {Touch} touch2 - 두 번째 터치
 * @param {HTMLCanvasElement} canvas - 캔버스 엘리먼트
 * @returns {Object} { x, y } 중심점의 캔버스 좌표
 */
export const getTouchCenter = (touch1, touch2, canvas) => {
  const centerX = (touch1.clientX + touch2.clientX) / 2;
  const centerY = (touch1.clientY + touch2.clientY) / 2;
  if (!canvas) return { x: centerX, y: centerY };
  // 캔버스 좌표로 변환
  const rect = canvas.getBoundingClientRect();
  const x = centerX - rect.left;
  const y = centerY - rect.top;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: x * scaleX,
    y: y * scaleY,
  };
};

/**
 * 터치 이벤트가 특정 영역 내부인지 확인
 * @param {Touch} touch - 터치 객체
 * @param {HTMLCanvasElement} canvas - 캔버스 엘리먼트
 * @param {Object} area - 영역 { x, y, width, height }
 * @returns {boolean} 영역 내부 여부
 */
export const isTouchInArea = (touch, canvas, area) => {
  const coords = getTouchCanvasCoordinates(touch, canvas);

  return (
    coords.x >= area.x &&
    coords.x <= area.x + area.width &&
    coords.y >= area.y &&
    coords.y <= area.y + area.height
  );
};

/**
 * 각도를 도(degree) 단위로 변환
 * @param {number} radians - 라디안 값
 * @returns {number} 도 단위 각도
 */
export const radiansToDegrees = (radians) => {
  return radians * (180 / Math.PI);
};

/**
 * 도(degree)를 라디안 단위로 변환
 * @param {number} degrees - 도 단위 각도
 * @returns {number} 라디안 값
 */
export const degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};
