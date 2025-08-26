/* eslint-disable */
// utils/pwaUtils.js - PWA 환경 감지 및 최적화 유틸리티

/**
 * PWA standalone 모드인지 감지
 * @returns {boolean} PWA standalone 모드 여부
 */
export const isPWAStandalone = () => {
  // iOS Safari PWA
  if (window.navigator.standalone === true) {
    return true;
  }

  // Android Chrome PWA (display-mode: standalone)
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // fallback: URL에 PWA 관련 파라미터가 있는지 확인
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('pwa') === 'true') {
    return true;
  }

  return false;
};

/**
 * 모바일 디바이스인지 감지
 * @returns {boolean} 모바일 디바이스 여부
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * iOS 디바이스인지 감지
 * @returns {boolean} iOS 디바이스 여부
 */
export const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Android 디바이스인지 감지
 * @returns {boolean} Android 디바이스 여부
 */
export const isAndroidDevice = () => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * PWA 환경에서의 카메라 최적화 설정 반환
 * @returns {Object} 카메라 제약조건 및 설정
 */
export const getPWACameraConstraints = () => {
  const isPWA = isPWAStandalone();
  const isIOS = isIOSDevice();
  const isAndroid = isAndroidDevice();

  // PWA 환경에서는 더 보수적인 설정 사용
  if (isPWA) {
    return {
      video: {
        width: isIOS 
          ? { ideal: 640, max: 1280 }  // iOS는 더 낮은 해상도
          : { ideal: 1280, max: 1920 },
        height: isIOS 
          ? { ideal: 480, max: 720 }   // iOS는 더 낮은 해상도
          : { ideal: 720, max: 1080 },
        frameRate: { ideal: 24, max: 30 }, // PWA에서는 더 낮은 프레임율
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1
      }
    };
  }

  // 일반 브라우저에서는 기존 고품질 설정
  return {
    video: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 },
      facingMode: 'user'
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1
    }
  };
};

/**
 * PWA에서 비디오 엘리먼트 최적화 설정 적용
 * @param {HTMLVideoElement} videoElement - 비디오 엘리먼트
 */
export const optimizeVideoForPWA = (videoElement) => {
  if (!videoElement || !isPWAStandalone()) return;

  // PWA에서 비디오 최적화 설정
  videoElement.playsInline = true;
  videoElement.muted = true;
  videoElement.autoplay = true;

  // iOS PWA 특별 처리
  if (isIOSDevice()) {
    videoElement.controls = false;
    videoElement.setAttribute('webkit-playsinline', 'true');
    videoElement.setAttribute('playsinline', 'true');
  }
};

/**
 * PWA 환경에서 MediaPipe 사용 가능 여부 확인
 * @returns {boolean} MediaPipe 사용 권장 여부
 */
export const shouldUseMediaPipeInPWA = () => {
  const isPWA = isPWAStandalone();
  const isIOS = isIOSDevice();

  // iOS PWA에서는 MediaPipe 비활성화 권장
  if (isPWA && isIOS) {
    return false;
  }

  // Android PWA에서는 조건부 사용
  if (isPWA && isAndroidDevice()) {
    // 성능이 좋은 디바이스에서만 사용
    return navigator.hardwareConcurrency >= 4;
  }

  return true;
};

/**
 * PWA 환경 정보 반환 (디버깅용)
 * @returns {Object} PWA 환경 정보
 */
export const getPWAEnvironmentInfo = () => {
  return {
    isPWAStandalone: isPWAStandalone(),
    isMobile: isMobileDevice(),
    isIOS: isIOSDevice(),
    isAndroid: isAndroidDevice(),
    userAgent: navigator.userAgent,
    displayMode: window.matchMedia ? {
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      minimal: window.matchMedia('(display-mode: minimal-ui)').matches,
      fullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
      browser: window.matchMedia('(display-mode: browser)').matches,
    } : null,
    navigatorStandalone: window.navigator.standalone,
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
  };
};

/**
 * PWA에서 카메라 스트림 대기 시간 계산
 * @returns {number} 밀리초 단위 대기 시간
 */
export const getPWACameraWaitTime = () => {
  const isPWA = isPWAStandalone();
  const isIOS = isIOSDevice();

  if (isPWA && isIOS) {
    return 2000; // iOS PWA는 2초 대기
  } else if (isPWA) {
    return 1000; // 기타 PWA는 1초 대기
  }

  return 500; // 일반 브라우저는 0.5초 대기
};

/**
 * iOS PWA에서 비디오 권한 재요청 함수
 * @returns {Promise<boolean>} 권한 획득 성공 여부
 */
export const requestIOSVideoPermission = async () => {
  if (!isIOSDevice() || !isPWAStandalone()) {
    return true; // iOS PWA가 아니면 그냥 성공으로 간주
  }

  try {
    // iOS PWA에서 비디오 권한 재요청
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: { ideal: 320 }, 
        height: { ideal: 240 },
        frameRate: { ideal: 15 }
      },
      audio: false
    });
    
    // 즉시 중지
    stream.getTracks().forEach(track => track.stop());
    
    console.log('✅ iOS PWA 비디오 권한 확인 완료');
    return true;
  } catch (error) {
    console.error('❌ iOS PWA 비디오 권한 실패:', error);
    return false;
  }
};

/**
 * iOS PWA를 위한 페이지 가시성 이벤트 리스너
 * @param {Function} onVisible - 페이지가 보일 때 실행할 함수
 * @param {Function} onHidden - 페이지가 숨겨질 때 실행할 함수
 * @returns {Function} 이벤트 리스너 제거 함수
 */
export const setupIOSPWAVisibilityHandler = (onVisible, onHidden) => {
  if (!isIOSDevice() || !isPWAStandalone()) {
    return () => {}; // iOS PWA가 아니면 빈 함수 반환
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('📱 iOS PWA 백그라운드 전환');
      onHidden && onHidden();
    } else {
      console.log('📱 iOS PWA 포그라운드 전환');
      onVisible && onVisible();
    }
  };

  const handlePageShow = (event) => {
    if (event.persisted) {
      console.log('📱 iOS PWA 캐시에서 복원');
      onVisible && onVisible();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pageshow', handlePageShow);

  // 클린업 함수 반환
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pageshow', handlePageShow);
  };
};

/**
 * PWA 성능 모니터링 정보 수집
 * @returns {Object} 성능 정보
 */
export const getPWAPerformanceInfo = () => {
  const memory = performance.memory || {};
  
  return {
    connectionType: navigator.connection?.effectiveType || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    memory: {
      used: memory.usedJSHeapSize ? Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'unknown',
      total: memory.totalJSHeapSize ? Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB' : 'unknown',
      limit: memory.jsHeapSizeLimit ? Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB' : 'unknown',
    },
    timing: performance.timing ? {
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
    } : null
  };
};