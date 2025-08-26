/* eslint-disable */
// utils/segmentationUtils.js - 클라이언트 렌더링 단계에서 MediaPipe 적용하는 완벽한 누끼 처리 로직

/**
 * 📷 원본 비디오 렌더링 (좌우 반전 적용)
 * @param {HTMLVideoElement} video - 비디오 요소
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 */
export const renderOriginalVideo = (
  video,
  ctx,
  transparentBackground = false
) => {
  const canvas = ctx.canvas;

  if (transparentBackground) {
    // 투명 배경 모드인 경우 캔버스를 지우고 투명하게 유지
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } 

  // 비디오 그리기 (좌우 반전)
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-canvas.width, 0);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();
};

/**
 * 🟢 완벽한 누끼 처리 - 클라이언트 렌더링용
 * @param {HTMLVideoElement} video - 비디오 요소
 * @param {ImageData|HTMLCanvasElement} segmentationMask - 세그멘테이션 마스크
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {boolean} flipHorizontal - 좌우 반전 여부 (기본: true)
 */

export const applyPerfectSegmentation = (
  video,
  segmentationMask,
  ctx,
  flipHorizontal = true,
  filterValue = 'none' // ✅ 추가
) => {
  if (!video || !segmentationMask || !ctx) {
    /* console.warn('❌ applyPerfectSegmentation: 필수 파라미터 누락'); */
    return;
  }

  try {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpCtx = tmpCanvas.getContext('2d');

    // ✅ 필터 적용
    tmpCtx.filter = filterValue || 'none';

    // 1. 원본 비디오 그리기
    if (flipHorizontal) {
      tmpCtx.save();
      tmpCtx.scale(-1, 1);
      tmpCtx.translate(-width, 0);
      tmpCtx.drawImage(video, 0, 0, width, height);
      tmpCtx.restore();
    } else {
      tmpCtx.drawImage(video, 0, 0, width, height);
    }

    // 2. 마스크 적용
    tmpCtx.globalCompositeOperation = 'destination-in';
    if (flipHorizontal) {
      tmpCtx.save();
      tmpCtx.translate(width, 0);
      tmpCtx.scale(-1, 1);
      tmpCtx.drawImage(segmentationMask, 0, 0, width, height);
      tmpCtx.restore();
    } else {
      tmpCtx.drawImage(segmentationMask, 0, 0, width, height);
    }

    // 3. 최종 출력
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tmpCanvas, 0, 0);
    tmpCanvas.remove();

  } catch (error) {
    /* console.error('❌ applyPerfectSegmentation 오류:', error); */
    renderOriginalVideo(video, ctx);
  }
};

// 🔄 변경: 전역 처리 제한 및 안전장치 추가
const participantMediaPipeInstances = new Map();
const processingQueue = new Map(); 
const MAX_CONCURRENT_PROCESSING = 2; // 동시 처리 제한
const PROCESSING_COOLDOWN = 100; // 처리 간격 (ms)
let globalProcessingCount = 0;

/**
 * 🛡️ 비디오 유효성 검사
 * @param {HTMLVideoElement} video - 비디오 요소
 * @param {string} participantId - 참가자 ID
 * @returns {boolean} 유효성
 */
const validateVideoForSegmentation = (video, participantId) => {
  if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    return false;
  }

  // 비디오 크기 제한 (메모리 보호)
  const maxDimension = 1920;
  if (video.videoWidth > maxDimension || video.videoHeight > maxDimension) {
    return false;
  }

  return true;
};

/**
 * 🔄 참가자별 MediaPipe 인스턴스 가져오기 또는 생성 (안전장치 추가)
 * @param {string} participantId - 참가자 ID
 * @returns {Promise<Object|null>} MediaPipe 인스턴스
 */
const getOrCreateMediaPipeInstance = async (participantId) => {
  // 기존 인스턴스 반환
  if (participantMediaPipeInstances.has(participantId)) {
    return participantMediaPipeInstances.get(participantId);
  }

  // 전역 인스턴스 수 제한 (메모리 보호)
  if (participantMediaPipeInstances.size >= 5) {
    return null;
  }

  try {
    // 동적 임포트로 MediaPipe 생성
    const { createSelfieSegmentation } = await import('../utils/mediaUtils');
    
    const selfieSegmentation = await createSelfieSegmentation({
      modelSelection: 0, // 속도 우선 모델 사용 (메모리 절약)
      selfieMode: true,
    });

    if (!selfieSegmentation) {
      throw new Error('MediaPipe 인스턴스 생성 실패');
    }

    // 인스턴스 저장
    participantMediaPipeInstances.set(participantId, {
      instance: selfieSegmentation,
      lastResult: null,
      isProcessing: false,
      lastProcessedTime: 0,
      errorCount: 0,
    });

    return participantMediaPipeInstances.get(participantId);

  } catch (error) {
    /* console.error(`❌ MediaPipe 생성 실패 (${participantId}):`, error.message); */
    return null;
  }
};

/**
 * 🔄 클라이언트에서 MediaPipe 세그멘테이션 처리 (강화된 안전장치)
 * @param {HTMLVideoElement} video - 비디오 요소
 * @param {string} participantId - 참가자 ID
 * @returns {Promise<Object|null>} 세그멘테이션 결과
 */
export const processClientSegmentation = async (video, participantId) => {
  // 기본 유효성 검사
  if (!validateVideoForSegmentation(video, participantId)) {
    return null;
  }

  // 전역 처리 수 제한
  if (globalProcessingCount >= MAX_CONCURRENT_PROCESSING) {
    return null;
  }

  // 개별 처리 중인 경우 스킵
  if (processingQueue.has(participantId)) {
    return null;
  }

  try {
    // 처리 시작 표시
    processingQueue.set(participantId, Date.now());
    globalProcessingCount++;

    // 참가자별 MediaPipe 인스턴스 가져오기
    const mediaInstance = await getOrCreateMediaPipeInstance(participantId);
    if (!mediaInstance) {
      return null;
    }

    const { instance: selfieSegmentation } = mediaInstance;

    // 처리 간격 제한 (throttling)
    const now = Date.now();
    if (now - mediaInstance.lastProcessedTime < PROCESSING_COOLDOWN) {
      return mediaInstance.lastResult;
    }

    // 이미 처리 중인 경우 이전 결과 반환
    if (mediaInstance.isProcessing) {
      return mediaInstance.lastResult;
    }

    // 에러 카운트 체크
    if (mediaInstance.errorCount >= 3) {
      cleanupParticipantMediaPipe(participantId);
      return null;
    }

    // 처리 시작
    mediaInstance.isProcessing = true;
    mediaInstance.lastProcessedTime = now;

    // 비디오 크기를 안전한 크기로 제한
    const canvas = document.createElement('canvas');
    const maxSize = 512; // MediaPipe에 안전한 크기
    const aspectRatio = video.videoWidth / video.videoHeight;
    
    if (aspectRatio > 1) {
      canvas.width = Math.min(maxSize, video.videoWidth);
      canvas.height = canvas.width / aspectRatio;
    } else {
      canvas.height = Math.min(maxSize, video.videoHeight);
      canvas.width = canvas.height * aspectRatio;
    }

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 결과를 저장할 변수들
    let segmentationResult = null;
    let isReady = false;

    // onResults 핸들러 설정 (참가자별)
    const onResultsHandler = (results) => {
      segmentationResult = results;
      mediaInstance.lastResult = results;
      isReady = true;
    };

    selfieSegmentation.onResults(onResultsHandler);

    // MediaPipe에 안전한 크기의 캔버스 전달
    await selfieSegmentation.send({ image: canvas });

    // 처리 완료될 때까지 대기 (더 짧은 시간)
    for (let i = 0; i < 3 && !isReady; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    // 임시 캔버스 정리
    canvas.remove();

    // 처리 완료 표시
    mediaInstance.isProcessing = false;

    if (!segmentationResult || !segmentationResult.segmentationMask) {
      mediaInstance.errorCount++;
      return null;
    }

    // 성공시 에러 카운트 리셋
    mediaInstance.errorCount = 0;
    return segmentationResult;

  } catch (error) {
    /* console.error(`❌ 세그멘테이션 오류 (${participantId}):`, error.message); */
    
    // 오류 발생시 해당 인스턴스 처리
    if (participantMediaPipeInstances.has(participantId)) {
      const mediaInstance = participantMediaPipeInstances.get(participantId);
      mediaInstance.isProcessing = false;
      mediaInstance.errorCount = (mediaInstance.errorCount || 0) + 1;
      
      // 메모리 오류인 경우 인스턴스 제거
      if (error.message.includes('memory access out of bounds') || mediaInstance.errorCount >= 3) {
        cleanupParticipantMediaPipe(participantId);
      }
    }
    
    return null;
  } finally {
    // 처리 완료 표시
    processingQueue.delete(participantId);
    globalProcessingCount = Math.max(0, globalProcessingCount - 1);
  }
};

/**
 * 🗑️ 참가자 MediaPipe 인스턴스 정리
 * @param {string} participantId - 참가자 ID
 */
export const cleanupParticipantMediaPipe = (participantId) => {
  if (participantMediaPipeInstances.has(participantId)) {
    const mediaInstance = participantMediaPipeInstances.get(participantId);
    
    try {
      mediaInstance.isProcessing = false;
      mediaInstance.lastResult = null;
    } catch (error) {
      // 무시
    }
    
    participantMediaPipeInstances.delete(participantId);
    processingQueue.delete(participantId);
  }
};

/**
 * 🎨 클라이언트에서 세그멘테이션이 적용된 비디오 렌더링 (개별 인스턴스 사용)
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {HTMLVideoElement} video - 비디오 요소
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {number} width - 너비
 * @param {number} height - 높이
 * @param {Object} options - 렌더링 옵션
 */
export const renderSegmentedVideo = async (ctx, video, x, y, width, height, options = {}) => {
  const {
    participantId = 'unknown',
    mode = 'original',
    filter = null,
    opacity = 1,
    flipHorizontal = true,
    rotation = 0, // 회전 각도 (0~359도)
  } = options;

  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    const segmentationMode = mapCameraModeToString(mode);

    // ✅ 필터 CSS 값
    const filterValue = getFilterValue(filter);

    // 🔄 회전 적용을 위한 변환 설정
    tempCtx.save();
    
    // 회전이 있는 경우 중심점을 기준으로 회전
    if (rotation !== 0) {
      const centerX = width / 2;
      const centerY = height / 2;
      tempCtx.translate(centerX, centerY);
      tempCtx.rotate((rotation * Math.PI) / 180);
      tempCtx.translate(-centerX, -centerY);
    }

    if (segmentationMode === 'original') {
      tempCtx.filter = filterValue || 'none';
      if (flipHorizontal) {
        tempCtx.save();
        tempCtx.scale(-1, 1);
        tempCtx.translate(-width, 0);
        tempCtx.drawImage(video, 0, 0, width, height);
        tempCtx.restore();
      } else {
        tempCtx.drawImage(video, 0, 0, width, height);
      }
    } else {
      const segmentationResult = await processClientSegmentation(video, participantId);
      if (segmentationResult && segmentationResult.segmentationMask) {
        applyPerfectSegmentation(
          segmentationResult.image,
          segmentationResult.segmentationMask,
          tempCtx,
          flipHorizontal,
          filterValue // ✅ 전달
        );
      } else {
        tempCtx.filter = filterValue || 'none';
        if (flipHorizontal) {
          tempCtx.save();
          tempCtx.scale(-1, 1);
          tempCtx.translate(-width, 0);
          tempCtx.drawImage(video, 0, 0, width, height);
          tempCtx.restore();
        } else {
          tempCtx.drawImage(video, 0, 0, width, height);
        }
      }
    }
    
    // 회전 변환 복원
    tempCtx.restore();

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(tempCanvas, x, y);
    ctx.restore();

    tempCanvas.remove();

  } catch (error) {
    /* console.error(`❌ ${participantId} 세그멘테이션 비디오 렌더링 오류:`, error); */
    ctx.save();
    ctx.globalAlpha = opacity;
    if (flipHorizontal) {
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      ctx.drawImage(video, x, y, width, height);
    } else {
      ctx.drawImage(video, x, y, width, height);
    }
    ctx.restore();
  }
};


/**
 * 🎨 필터 이름을 CSS filter 값으로 변환
 * @param {string} filterName - 필터 이름
 * @returns {string} CSS filter 값
 */
export const getFilterValue = (filterName) => {
  const filterMap = {
    원본: 'none',
    세피아: 'sepia(0.8) saturate(1.2) contrast(1.1)',
    흑백: 'grayscale(1) contrast(1.1) brightness(1.05)',
    빈티지: 'sepia(0.4) saturate(0.8) contrast(1.2) brightness(0.95) hue-rotate(15deg)',
    술톤: 'saturate(1.3) contrast(1.1) brightness(1.05) hue-rotate(-10deg)',
    뽀샤시: 'saturate(0.8) contrast(0.8) brightness(1.2) hue-rotate(20deg)',
    드라마틱: 'contrast(1.4) saturate(1.1) brightness(0.95)',
    소프트: 'blur(0.3px) brightness(1.1) saturate(0.9) contrast(0.95)',
  };
  return filterMap[filterName] || 'none';
};

/**
 * 🟢 MediaPipe 결과로 완벽한 누끼 처리 (기존 호환용)
 * @param {Object} results - MediaPipe 결과 객체
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 */
export const applyMediaPipeSegmentation = (results, ctx) => {
  const { image, segmentationMask } = results;
  if (!image || !segmentationMask || !ctx) {
    /* console.warn('❌ applyMediaPipeSegmentation: 필수 파라미터 누락'); */
    return;
  }

  applyPerfectSegmentation(image, segmentationMask, ctx);
};

/**
 * 🟢 비동기 세그멘테이션 처리 (기존 호환용)
 * @param {HTMLVideoElement} video - 비디오 요소
 * @param {HTMLCanvasElement} canvas - 캔버스 요소
 * @param {Object} selfieSegmentation - MediaPipe 인스턴스
 * @param {Object} segmentationResultRef - 결과 ref
 * @param {Object} segmentationReadyRef - 준비 상태 ref
 */
export const drawSegmentedParticipant = async (
  video, 
  canvas, 
  selfieSegmentation, 
  segmentationResultRef, 
  segmentationReadyRef
) => {
  if (!video || video.readyState < 2 || !selfieSegmentation) return;

  try {
    // MediaPipe에 프레임 전달
    segmentationReadyRef.current = false;
    await selfieSegmentation.send({ image: video });

    // 처리 완료될 때까지 대기 (최대 10프레임)
    for (let i = 0; i < 10 && !segmentationReadyRef.current; i++) {
      await new Promise(resolve => setTimeout(resolve, 16)); // ~1 frame
    }

    if (!segmentationResultRef.current || !segmentationResultRef.current.segmentationMask) {
      // 세그멘테이션 실패 시 원본 그리기
      const ctx = canvas.getContext('2d');
      renderOriginalVideo(video, ctx);
      return;
    }

    // 완벽한 누끼 처리 적용
    const ctx = canvas.getContext('2d');
    applyPerfectSegmentation(
      segmentationResultRef.current.image,
      segmentationResultRef.current.segmentationMask,
      ctx
    );

  } catch (error) {
    /* console.error('❌ drawSegmentedParticipant 오류:', error); */
    // 오류 발생 시 원본 그리기
    const ctx = canvas.getContext('2d');
    renderOriginalVideo(video, ctx);
  }
};

/**
 * 🎭 세그멘테이션 모드별 처리 분기 (업데이트됨)
 * @param {string} mode - 세그멘테이션 모드 ('original' | 'person' | 'face')
 * @param {HTMLVideoElement} video - 비디오 요소
 * @param {HTMLCanvasElement} canvas - 캔버스 요소
 * @param {Object} options - 추가 옵션들
 */
export const processSegmentationMode = async (mode, video, canvas, options = {}) => {
  const {
    selfieSegmentation,
    segmentationResultRef,
    segmentationReadyRef,
    blazefaceModel
  } = options;

  if (!video || !canvas) return;

  const ctx = canvas.getContext('2d');
  
  try {
    switch (mode) {
      case 'face':
      case 'person':
        // 🟢 face와 person 모드 모두 동일하게 처리
        if (selfieSegmentation && segmentationResultRef && segmentationReadyRef) {
          await drawSegmentedParticipant(
            video, 
            canvas, 
            selfieSegmentation, 
            segmentationResultRef, 
            segmentationReadyRef
          );
        } else {
          renderOriginalVideo(video, ctx);
        }
        break;
        
      case 'original':
      default:
        renderOriginalVideo(video, ctx);
        break;
    }
  } catch (error) {
    /* console.error(`❌ 세그멘테이션 처리 오류 (${mode}):`, error); */
    // 오류 발생 시 원본으로 대체
    renderOriginalVideo(video, ctx);
  }
};

/**
 * 🎯 cameraStore 모드 숫자를 문자열로 변환
 * @param {number} cameraMode - cameraStore의 숫자 모드 (1, 2, 3)
 * @returns {string} 문자열 모드 ('original' | 'person' | 'face')
 */
export const mapCameraModeToString = (cameraMode) => {
  const modeMap = {
    1: 'original',
    2: 'person',
    3: 'face',
  };
  return modeMap[cameraMode] || 'original';
};

/**
 * 🎯 문자열 모드를 cameraStore 숫자로 변환
 * @param {string} modeString - 문자열 모드 ('original' | 'person' | 'face')
 * @returns {number} cameraStore 숫자 모드 (1, 2, 3)
 */
export const mapStringToCameraMode = (modeString) => {
  const modeNumberMap = {
    original: 1,
    person: 2,
    face: 3,
  };
  return modeNumberMap[modeString] || 1;
};

/**
 * 📊 세그멘테이션 모드 정보 가져오기
 * @param {string} mode - 세그멘테이션 모드
 * @returns {Object} 모드 정보 (label, icon, description)
 */
export const getSegmentationModeInfo = (mode) => {
  const modeInfoMap = {
    original: {
      label: '원본',
      icon: '📷',
      description: '원본 영상 (AI 처리 없음)',
    },
    person: {
      label: '사람',
      icon: '👤',
      description: '클라이언트 누끼 처리',
    },
    face: {
      label: '얼굴',
      icon: '😀',
      description: '클라이언트 누끼 처리',
    },
  };

  return modeInfoMap[mode] || modeInfoMap.original;
};

/**
 * 🔧 캔버스 크기 설정 (반응형 비율 적용)
 * @param {HTMLCanvasElement} canvas - 캔버스 요소
 * @param {number} width - 너비 (기본값: 640)
 * @param {number} height - 높이 (기본값: 480)
 */
export const setupCanvasSize = (canvas, width = 640, height = 480) => {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
  
  // 모바일 환경 체크
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // 모바일에서는 컨테이너 크기에 맞춰 4:3 비율 유지
    const containerWidth = canvas.parentElement?.clientWidth || width;
    const aspectRatio = 4 / 3;
    const calculatedHeight = containerWidth / aspectRatio;
    
    // 최소 높이 보장 (280px)
    const finalHeight = Math.max(calculatedHeight, 280);
    const finalWidth = finalHeight * aspectRatio;
    
    canvas.width = finalWidth;
    canvas.height = finalHeight;
  } else {
    // 데스크톱에서는 기본 크기 사용
    canvas.width = width;
    canvas.height = height;
  }
};

/**
 * 🎨 캔버스 배경 설정 (누끼 모드에서는 항상 투명)
 * @param {HTMLCanvasElement} canvas - 캔버스 요소
 * @param {string} mode - 세그멘테이션 모드
 */
export const setupCanvasBackground = (canvas, mode) => {
  if (!canvas) return;
  
  const container = canvas.parentElement;
  if (!container) return;
  
  if (mode === 'original') {
    // 원본 모드: 검은색 배경
    canvas.style.background = 'black';
    container.style.background = 'black';
  } else {
    // 🟢 누끼 모드: 캔버스는 완전히 투명 (배경 없음)
    canvas.style.background = 'transparent';
    canvas.style.backgroundColor = 'transparent';
    
    // 컨테이너에서 체크 패턴 표시 (투명도 확인용)
    container.style.background = 'repeating-conic-gradient(#e5e5e5 0% 25%, transparent 0% 50%) 50% / 20px 20px';
  }
};

/**
 * ⚙️ 세그멘테이션 설정 검증
 * @param {Object} config - 설정 객체
 * @returns {Object} 검증 결과 { isValid, errors[] }
 */
export const validateSegmentationConfig = (config) => {
  const errors = [];

  if (!config) {
    errors.push('설정 객체가 필요합니다');
    return { isValid: false, errors };
  }

  const { mode, canvas, video } = config;

  // 모드 검증
  if (!mode || !['original', 'person', 'face'].includes(mode)) {
    errors.push('유효하지 않은 세그멘테이션 모드입니다');
  }

  // 캔버스 검증
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    errors.push('유효한 캔버스 요소가 필요합니다');
  } else if (canvas.width <= 0 || canvas.height <= 0) {
    errors.push('캔버스 크기가 설정되지 않았습니다');
  }

  // 비디오 검증 (원본 모드가 아닌 경우)
  if (mode !== 'original') {
    if (!video || !(video instanceof HTMLVideoElement)) {
      errors.push('유효한 비디오 요소가 필요합니다');
    } else if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      errors.push('비디오가 로드되지 않았습니다');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 🧹 임시 캔버스 정리 (메모리 누수 방지)
 * @param {HTMLCanvasElement[]} tempCanvases - 정리할 임시 캔버스 배열
 */
export const cleanupTempCanvases = (tempCanvases = []) => {
  tempCanvases.forEach((canvas) => {
    if (canvas && canvas.remove) {
      canvas.remove();
    }
  });
};


/**
 * 📝 세그멘테이션 상태 로깅 (개발용)
 * @param {string} mode - 현재 모드
 * @param {Object} additionalInfo - 추가 정보
 */
export const logSegmentationState = (mode, additionalInfo = {}) => {
  const modeInfo = getSegmentationModeInfo(mode);

};

/**
 * 🟢 클라이언트용 MediaPipe 초기화 헬퍼 (더 이상 사용하지 않음)
 * @deprecated 이제 각 참가자별로 자동 생성됩니다
 */
export const initializeClientMediaPipe = async (options = {}) => {
  return null;
};

/**
 * 🗑️ 모든 MediaPipe 인스턴스 정리
 */
export const cleanupAllMediaPipeInstances = () => {
  for (const [participantId] of participantMediaPipeInstances) {
    cleanupParticipantMediaPipe(participantId);
  }
  
  participantMediaPipeInstances.clear();
  processingQueue.clear();
};