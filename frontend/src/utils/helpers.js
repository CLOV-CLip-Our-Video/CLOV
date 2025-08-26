/* eslint-disable */
/**
 * CLOV 프로젝트 유틸리티 헬퍼 함수들
 * 팀원들이 공통으로 사용할 유틸리티 함수들을 정의합니다.
 */

import { ERROR_CODES, ERROR_MESSAGES, FILE_CONFIG, ROOM_CONFIG } from './constants.js';

// ===== 문자열 유틸리티 =====

/**
 * 방 코드 생성 (6자리 알파벳 + 숫자)
 * @returns {string} 생성된 방 코드
 */
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < ROOM_CONFIG.ROOM_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 방 코드 유효성 검사
 * @param {string} roomCode - 검사할 방 코드
 * @returns {boolean} 유효한지 여부
 */
export const validateRoomCode = (roomCode) => {
  if (!roomCode || typeof roomCode !== 'string') return false;
  return roomCode.length === ROOM_CONFIG.ROOM_CODE_LENGTH && 
         /^[A-Z0-9]+$/.test(roomCode);
};

/**
 * 닉네임 유효성 검사
 * @param {string} nickname - 검사할 닉네임
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateNickname = (nickname) => {
  if (!nickname || typeof nickname !== 'string') {
    return { isValid: false, error: '닉네임을 입력해주세요.' };
  }
  
  const trimmed = nickname.trim();
  
  if (trimmed.length < ROOM_CONFIG.NICKNAME_MIN_LENGTH) {
    return { isValid: false, error: `닉네임은 최소 ${ROOM_CONFIG.NICKNAME_MIN_LENGTH}자 이상이어야 합니다.` };
  }
  
  if (trimmed.length > ROOM_CONFIG.NICKNAME_MAX_LENGTH) {
    return { isValid: false, error: `닉네임은 최대 ${ROOM_CONFIG.NICKNAME_MAX_LENGTH}자까지 가능합니다.` };
  }
  
  // 특수문자 제한 (한글, 영문, 숫자, 일부 기호만 허용)
  if (!/^[가-힣a-zA-Z0-9\s._-]+$/.test(trimmed)) {
    return { isValid: false, error: '닉네임에 사용할 수 없는 문자가 포함되어 있습니다.' };
  }
  
  return { isValid: true };
};

/**
 * 텍스트 줄임표 처리
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이
 * @returns {string} 줄임표가 적용된 텍스트
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// ===== 시간 유틸리티 =====

/**
 * 시간을 MM:SS 형식으로 포맷팅
 * @param {number} seconds - 초 단위 시간
 * @returns {string} MM:SS 형식 문자열
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 시간을 사람이 읽기 쉬운 형식으로 변환
 * @param {number} timestamp - 타임스탬프 (ms)
 * @returns {string} 상대적 시간 문자열
 */
export const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return new Date(timestamp).toLocaleDateString();
};

/**
 * 파일명에 타임스탬프 추가
 * @param {string} baseName - 기본 파일명
 * @param {string} extension - 확장자
 * @returns {string} 타임스탬프가 포함된 파일명
 */
export const generateTimestampFilename = (baseName, extension) => {
  const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '');
  return `${baseName}_${timestamp}.${extension}`;
};

// ===== 숫자 유틸리티 =====

/**
 * 값을 지정된 범위로 제한
 * @param {number} value - 제한할 값
 * @param {number} min - 최솟값
 * @param {number} max - 최댓값
 * @returns {number} 제한된 값
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * 랜덤한 정수 생성
 * @param {number} min - 최솟값 (포함)
 * @param {number} max - 최댓값 (포함)
 * @returns {number} 랜덤 정수
 */
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 * @param {number} bytes - 바이트 크기
 * @param {number} decimals - 소수점 자릿수
 * @returns {string} 포맷된 크기 문자열
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// ===== 파일 유틸리티 =====

/**
 * 파일 타입 검사
 * @param {File} file - 검사할 파일
 * @param {string[]} allowedTypes - 허용된 MIME 타입들
 * @returns {boolean} 허용된 타입인지 여부
 */
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * 파일 크기 검사
 * @param {File} file - 검사할 파일
 * @param {number} maxSize - 최대 크기 (bytes)
 * @returns {boolean} 크기가 적절한지 여부
 */
export const isValidFileSize = (file, maxSize = FILE_CONFIG.MAX_SIZE) => {
  return file.size <= maxSize;
};

/**
 * 이미지 파일 검증
 * @param {File} file - 검사할 파일
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: '파일을 선택해주세요.' };
  }
  
  if (!isValidFileType(file, FILE_CONFIG.ALLOWED_IMAGE_TYPES)) {
    return { isValid: false, error: '지원하지 않는 이미지 형식입니다.' };
  }
  
  if (!isValidFileSize(file, FILE_CONFIG.BACKGROUND_MAX_SIZE)) {
    return { isValid: false, error: `파일 크기는 ${formatFileSize(FILE_CONFIG.BACKGROUND_MAX_SIZE)} 이하여야 합니다.` };
  }
  
  return { isValid: true };
};

/**
 * 파일을 Base64로 변환
 * @param {File} file - 변환할 파일
 * @returns {Promise<string>} Base64 문자열
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ===== URL 유틸리티 =====

/**
 * 현재 페이지 URL 복사
 * @returns {Promise<boolean>} 복사 성공 여부
 */
export const copyCurrentUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch (error) {
    /* console.error('URL 복사 실패:', error); */
    return false;
  }
};

/**
 * 방 참여 URL 생성
 * @param {string} roomCode - 방 코드
 * @returns {string} 생성된 URL
 */
export const generateRoomUrl = (roomCode) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/room/${roomCode}`;
};

/**
 * QR 코드 URL 생성 (외부 서비스 이용)
 * @param {string} text - QR 코드에 담을 텍스트
 * @param {number} size - QR 코드 크기
 * @returns {string} QR 코드 이미지 URL
 */
export const generateQRCodeUrl = (text, size = 200) => {
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
};

// ===== 브라우저 유틸리티 =====

/**
 * 브라우저 기능 지원 여부 확인
 * @param {string} feature - 확인할 기능명
 * @returns {boolean} 지원 여부
 */
export const isBrowserFeatureSupported = (feature) => {
  switch (feature) {
    case 'mediaDevices':
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    case 'RTCPeerConnection':
      return !!(window.RTCPeerConnection || window.webkitRTCPeerConnection);
    case 'MediaRecorder':
      return !!window.MediaRecorder;
    case 'Canvas':
      return !!document.createElement('canvas').getContext;
    case 'WebSocket':
      return !!window.WebSocket;
    case 'clipboard':
      return !!(navigator.clipboard && navigator.clipboard.writeText);
    default:
      return false;
  }
};

/**
 * 모바일 디바이스 감지
 * @returns {boolean} 모바일 디바이스 여부
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * 브라우저 이름 감지
 * @returns {string} 브라우저 이름
 */
export const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
};

// ===== 성능 유틸리티 =====

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 * @returns {Function} 디바운스된 함수
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 스로틀 함수
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (ms)
 * @returns {Function} 스로틀된 함수
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 비동기 함수 재시도
 * @param {Function} fn - 실행할 비동기 함수
 * @param {number} retries - 재시도 횟수
 * @param {number} delay - 재시도 간격 (ms)
 * @returns {Promise} 함수 실행 결과
 */
export const retryAsync = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryAsync(fn, retries - 1, delay);
    }
    throw error;
  }
};

// ===== 배열 유틸리티 =====

/**
 * 배열에서 중복 제거
 * @param {Array} array - 원본 배열
 * @returns {Array} 중복이 제거된 배열
 */
export const removeDuplicates = (array) => {
  return [...new Set(array)];
};

