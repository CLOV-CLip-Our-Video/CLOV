/* eslint-disable */
// utils/optimizedSegmentationUtils.js - 좌표 기반 라운드-로빈 MediaPipe 최적화 + 얼굴 기능

import { getOverlayById } from './constants';

// 좌표 기반 라운드-로빈 스케줄러
const segmentationScheduler = {
  participantQueue: [],           // 순환할 참가자 목록
  currentIndex: 0,                // 현재 처리할 참가자 인덱스
  cachedMasks: new Map(),         // 참가자별 캐시된 마스크 좌표
  frameCount: 0,                  // 총 프레임 카운터
  maxCacheAge: 1000,             // 인체 캐시 최대 유지 시간
  forceUpdateInterval: 300,      // 인체 강제 업데이트 간격
  faceCacheAge: 1200,             // 얼굴 캐시 시간 (더 짧게)
  faceUpdateInterval: 300,       // 얼굴 강제 업데이트 간격
  isTwoPersonMode: false,        // 2명 모드 플래그 추가
};

// 기존 participantMediaPipeInstances 유지
const participantMediaPipeInstances = new Map();
const MAX_CONCURRENT_PROCESSING = 2;
let globalProcessingCount = 0;
let lastFaceMaskCache = {};

/**
 * 참가자 큐 업데이트
 */
export const updateParticipantQueue = (participantIds) => {
  const validIds = participantIds.filter(id => id && typeof id === 'string');
  
  const wasTwoPersonMode = segmentationScheduler.isTwoPersonMode;
  segmentationScheduler.isTwoPersonMode = validIds.length === 2;
  
  if (segmentationScheduler.participantQueue.length === 0 || 
      !arraysEqual(segmentationScheduler.participantQueue, validIds) ||
      wasTwoPersonMode !== segmentationScheduler.isTwoPersonMode) {
    
    segmentationScheduler.participantQueue = [...validIds];
    segmentationScheduler.currentIndex = 0;
    
    // 퇴장한 참가자의 캐시 정리
    for (const [participantId] of segmentationScheduler.cachedMasks) {
      if (!validIds.includes(participantId)) {
        segmentationScheduler.cachedMasks.delete(participantId);
        cleanupParticipantMediaPipe(participantId);
      }
    }
  }
};

/**
 * 2명 모드에서 모든 모드 미리 처리
 */
const preProcessAllModesFor2Person = async (video, participantId) => {
  if (!segmentationScheduler.isTwoPersonMode) {
    return false;
  }
  
  // 전역 처리 수 제한 체크
  if (globalProcessingCount >= MAX_CONCURRENT_PROCESSING) {
    return false;
  }
  
  try {
    // 인체와 얼굴 모드 둘 다 처리 시도
    const promises = [];
    
    // 인체 모드 처리
    if (!getCachedMask(participantId, 'person') || needsForceUpdate(participantId, 'person')) {
      promises.push(
        executeCoordinateMediaPipe(video, participantId)
          .then(maskData => {
            if (maskData) {
              setCachedMask(participantId, 'person', maskData);
            }
          })
          .catch(() => {}) // 에러 무시
      );
    }
    
    // 얼굴 모드 처리  
    if (!getCachedMask(participantId, 'face') || needsForceUpdate(participantId, 'face')) {
      promises.push(
        executeFaceSegmentation(video, participantId)
          .then(maskData => {
            if (maskData) {
              setCachedMask(participantId, 'face', maskData);
            }
          })
          .catch(() => {}) // 에러 무시
      );
    }
    
    // 하나라도 처리했으면 성공
    if (promises.length > 0) {
      globalProcessingCount++;
      await Promise.allSettled(promises);
      return true;
    }
    
  } catch (error) {
    // 에러 무시
  } finally {
    if (globalProcessingCount > 0) {
      globalProcessingCount = Math.max(0, globalProcessingCount - 1);
    }
  }
  
  return false;
};

/**
 * 다음 처리할 참가자 선택
 */
const getNextParticipantToProcess = () => {
  const queue = segmentationScheduler.participantQueue;
  
  if (queue.length === 0) {
    return null;
  }
  
  const participantId = queue[segmentationScheduler.currentIndex];
  segmentationScheduler.currentIndex = (segmentationScheduler.currentIndex + 1) % queue.length;
  
  return participantId;
};

/**
 * 캐시된 마스크 가져오기
 */
const getCachedMask = (participantId, mode = 'person') => {
  const cached = segmentationScheduler.cachedMasks.get(participantId);
  
  if (!cached || !cached[mode]) {
    return null;
  }
  
  const now = Date.now();
  const age = now - cached[mode].timestamp;
  const maxAge = mode === 'face' ? segmentationScheduler.faceCacheAge : segmentationScheduler.maxCacheAge;
  
  if (age > maxAge) {
    delete cached[mode];
    if (Object.keys(cached).length === 0) {
      segmentationScheduler.cachedMasks.delete(participantId);
    }
    return null;
  }
  
  return cached[mode].maskData;
};

/**
 * 마스크 캐싱
 */
const setCachedMask = (participantId, mode, maskData) => {
  const now = Date.now();
  
  if (!segmentationScheduler.cachedMasks.has(participantId)) {
    segmentationScheduler.cachedMasks.set(participantId, {});
  }
  
  const participantCache = segmentationScheduler.cachedMasks.get(participantId);
  participantCache[mode] = {
    maskData: maskData,
    timestamp: now,
    lastProcessed: now,
  };
};

/**
 * 강제 업데이트 필요 여부 확인
 */
const needsForceUpdate = (participantId, mode = 'person') => {
  const cached = segmentationScheduler.cachedMasks.get(participantId);
  
  if (!cached || !cached[mode]) {
    return true;
  }
  
  const now = Date.now();
  const timeSinceLastProcess = now - cached[mode].lastProcessed;
  const updateInterval = mode === 'face' ? segmentationScheduler.faceUpdateInterval : segmentationScheduler.forceUpdateInterval;
  
  // 얼굴 모드의 경우, MediaPipe 인스턴스의 에러 상태도 고려
  if (mode === 'face') {
    const instanceKey = `${participantId}_face`;
    const mediaInstance = participantMediaPipeInstances.get(instanceKey);
    
    // 에러가 누적된 경우 더 자주 재시도
    if (mediaInstance && mediaInstance.errorCount > 0) {
      return timeSinceLastProcess > (updateInterval / 2); 
    }
  }

  return timeSinceLastProcess > updateInterval;
};

/**
 * 좌표 기반 세그멘테이션 처리 (모드별 지원)
 */
export const processCoordinateSegmentation = async (video, participantId, mode = 'person') => {
  // 기본 유효성 검사
  if (!validateVideoForSegmentation(video, participantId)) {
    return getCachedMask(participantId, mode);
  }
  
  // 2명 모드일 때 특별 처리
  if (segmentationScheduler.isTwoPersonMode) {
    // 캐시에서 먼저 확인
    const cachedMask = getCachedMask(participantId, mode);
    
    // 캐시가 있으면 바로 반환하고, 백그라운드에서 미리 처리
    if (cachedMask) {
      // 백그라운드에서 다른 모드도 미리 처리 (논블로킹)
      preProcessAllModesFor2Person(video, participantId).catch(() => {});
      return cachedMask;
    }
    
    // 캐시가 없으면 요청된 모드만 즉시 처리
    if (globalProcessingCount < MAX_CONCURRENT_PROCESSING) {
      try {
        globalProcessingCount++;
        
        let maskData = null;
        if (mode === 'face') {
          maskData = await executeFaceSegmentation(video, participantId);
        } else {
          maskData = await executeCoordinateMediaPipe(video, participantId);
        }
        
        if (maskData) {
          setCachedMask(participantId, mode, maskData);
          
          // 성공하면 다른 모드도 백그라운드에서 처리
          setTimeout(() => {
            preProcessAllModesFor2Person(video, participantId).catch(() => {});
          }, 0);
          
          return maskData;
        }
        
      } catch (error) {
        // 에러 무시
      } finally {
        globalProcessingCount = Math.max(0, globalProcessingCount - 1);
      }
    }
    
    return null;
  }

  // 전역 처리 수 제한
  if (globalProcessingCount >= MAX_CONCURRENT_PROCESSING) {
    return getCachedMask(participantId, mode);
  }
  
  // 라운드-로빈 스케줄링 체크
  const nextToProcess = getNextParticipantToProcess();
  const shouldProcess = (nextToProcess === participantId) || needsForceUpdate(participantId, mode);
  
  if (!shouldProcess) {
    return getCachedMask(participantId, mode);
  }
  
  try {
    globalProcessingCount++;
    
    let maskData = null;
    if (mode === 'face') { //얼굴모드
      maskData = await executeFaceSegmentation(video, participantId);
    } else { //전신모드
      maskData = await executeCoordinateMediaPipe(video, participantId);
    }
    
    if (maskData) {
      setCachedMask(participantId, mode, maskData);
      return maskData;
    } else {
      //마스크결과 없으면 캐시 사용
      const existingCache = getCachedMask(participantId, mode);
      if (existingCache) {
        // 캐시 타임스탬프 업데이트. 좀 더 오래 사용
        const cached = segmentationScheduler.cachedMasks.get(participantId);
        if (cached && cached[mode]) {
          cached[mode].lastProcessed = Date.now();
        }
      }
      return existingCache;
    }
    
  } catch (error) {
    return getCachedMask(participantId, mode);
  } finally {
    globalProcessingCount = Math.max(0, globalProcessingCount - 1);
  }
};

/**
 * 🎯 실제 MediaPipe 처리 실행 (인체용)
 */
const executeCoordinateMediaPipe = async (video, participantId) => {
  // 참가자별 MediaPipe 인스턴스 가져오기
  const mediaInstance = await getOrCreateMediaPipeInstance(participantId, 'selfie');
  if (!mediaInstance) {
    return null;
  }
  
  const { instance: selfieSegmentation } = mediaInstance;
  
  if (mediaInstance.isProcessing || mediaInstance.errorCount >= 3) {
    return null;
  }
  
  try {
    mediaInstance.isProcessing = true;
    
    // 비디오 크기를 안전한 크기로 제한
    const canvas = document.createElement('canvas');
    const maxSize = 256;
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
    
    let segmentationMask = null;
    let isReady = false;
    
    const onResultsHandler = (results) => {
      if (results.segmentationMask) {
        segmentationMask = results.segmentationMask;
        isReady = true;
      }
    };
    
    selfieSegmentation.onResults(onResultsHandler);
    await selfieSegmentation.send({ image: canvas });
    
    // 논블로킹 대기
    const startTime = Date.now();
    while (!isReady && (Date.now() - startTime) < 8) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    canvas.remove();
    
    if (!segmentationMask) {
      mediaInstance.errorCount++;
      return null;
    }
    
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.drawImage(segmentationMask, 0, 0);
    
    mediaInstance.errorCount = 0;
    
    return {
      maskCanvas: maskCanvas,
      width: canvas.width,
      height: canvas.height,
      originalVideoWidth: video.videoWidth,
      originalVideoHeight: video.videoHeight,
    };
    
  } catch (error) {
    mediaInstance.errorCount = (mediaInstance.errorCount || 0) + 1;
    
    if (error.message.includes('memory access out of bounds') || mediaInstance.errorCount >= 3) {
      cleanupParticipantMediaPipe(participantId);
    }
    
    return null;
  } finally {
    mediaInstance.isProcessing = false;
  }
};

/**
 * 얼굴 세그멘테이션 실행 (FaceMesh 기반)
 */
const executeFaceSegmentation = async (video, participantId) => {
  const mediaInstance = await getOrCreateMediaPipeInstance(participantId, 'face');
  if (!mediaInstance) {
    return null;
  }
  
  const { instance: faceMesh } = mediaInstance;
  
  if (mediaInstance.isProcessing || mediaInstance.errorCount >= 10) {
    return null;
  }
  
  try {
    mediaInstance.isProcessing = true;
    
    const canvas = document.createElement('canvas');
    const maxSize = 384; // 얼굴은 더 정밀하게
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
    
    let faceResults = null;
    let isReady = false;
    
    const onResultsHandler = (results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        faceResults = results;
        isReady = true;
      }
    };
    
    faceMesh.onResults(onResultsHandler);
    await faceMesh.send({ image: canvas });
    
    // 논블로킹 대기
    const startTime = Date.now();
    while (!isReady && (Date.now() - startTime) < 25) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    canvas.remove();
    
    if (!faceResults || !faceResults.multiFaceLandmarks[0]) {
      mediaInstance.errorCount++;
      mediaInstance.lastErrorTime = Date.now(); // 에러 시간 기록
      return null;
    }
    
    // FaceMesh 랜드마크로 얼굴 윤곽 마스크 생성
    const faceContourMask = createFaceContourMask(
      faceResults.multiFaceLandmarks[0], 
      canvas.width, 
      canvas.height
    );
    
    mediaInstance.errorCount = 0;
    
    return {
      maskCanvas: faceContourMask,
      width: canvas.width,
      height: canvas.height,
      originalVideoWidth: video.videoWidth,
      originalVideoHeight: video.videoHeight,
      landmarks: faceResults.multiFaceLandmarks[0],
    };
    
  } catch (error) {
    mediaInstance.errorCount = (mediaInstance.errorCount || 0) + 1;
    
    if (error.message.includes('memory access out of bounds') || mediaInstance.errorCount >= 10) {
      cleanupParticipantMediaPipe(participantId);
    }
    
    return null;
  } finally {
    mediaInstance.isProcessing = false;
  }
};

/**
 * 🎯 FaceMesh 랜드마크로 얼굴 윤곽 마스크 생성
 */
const createFaceContourMask = (landmarks, width, height) => {
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = width;
  faceCanvas.height = height;
  const faceCtx = faceCanvas.getContext('2d');

  // 1. 투명하게 초기화 (중요!)
  faceCtx.clearRect(0, 0, width, height);

  // 얼굴 윤곽선 인덱스
  const faceContourIndices = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
  ];

  // 2. 윤곽선 polygon 그리기
  faceCtx.beginPath();
  faceContourIndices.forEach((index, i) => {
    const landmark = landmarks[index];
    if (!landmark) return;
    const x = landmark.x * width;
    const y = landmark.y * height;
    if (i === 0) faceCtx.moveTo(x, y);
    else faceCtx.lineTo(x, y);
  });
  faceCtx.closePath();

  // 3. 내부를 흰색으로 채움
  faceCtx.fillStyle = 'white';
  faceCtx.globalAlpha = 1.0;
  faceCtx.fill();

  // 디버깅: 마스크 실제 모양 확인
  // document.body.appendChild(faceCanvas);

  return faceCanvas;
};

/**
 * 🎯 실시간 스트림 + 캐시된 좌표로 마스킹 적용
 */
export const renderStreamWithCachedMask = async (ctx, video, x, y, width, height, options = {}) => {
  const {
    participantId = 'unknown',
    mode = 'original',
    filter = null,
    opacity = 1,
    flipHorizontal = true,
    rotation = 0,
    overlay = null,
  } = options;
  
  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    const segmentationMode = mapCameraModeToString(mode);
    const filterValue = getFilterValue(filter);
    
    if (segmentationMode === 'original') {
      // 원본 모드
      applyOriginalRender(tempCtx, video, width, height, flipHorizontal, filterValue);
    } else if (segmentationMode === 'face') {
      // 얼굴 모드
      await renderFaceOnly(tempCtx, video, width, height, participantId, flipHorizontal, filterValue);
    } else {
      // 인체 모드
      await renderPersonOnly(tempCtx, video, width, height, participantId, flipHorizontal, filterValue);
    }
    
    //  오버레이 렌더링 (비디오 렌더링 후, 최종 캔버스 적용 전)
    if (overlay && overlay !== 'none') {
      try{
        const overlayItem = getOverlayById(overlay);
        if(overlayItem){
        await processFaceOverlay(tempCtx, video, overlayItem, participantId, flipHorizontal);
        }
      }catch (error) {
        //얼굴 인식 없음
      }
    }
    
    // 최종 렌더링
    ctx.save();
    ctx.globalAlpha = opacity;
    
    if (rotation !== 0) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(tempCanvas, -width / 2, -height / 2);
    } else {
      ctx.drawImage(tempCanvas, x, y);
    }
    
    ctx.restore();
    tempCanvas.remove();
    
  } catch (error) {
    // 오류 발생 시 원본으로 대체
    renderFallback(ctx, video, x, y, width, height, rotation, opacity, flipHorizontal);
  }
};

/**
 * 🎯 원본 렌더링
 */
const applyOriginalRender = (ctx, video, width, height, flipHorizontal, filterValue) => {
  ctx.filter = filterValue || 'none';
  
  if (flipHorizontal) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, width, height);
  }
};

/**
 * 🎯 인체만 렌더링
 */
const renderPersonOnly = async (ctx, video, width, height, participantId, flipHorizontal, filterValue) => {
  const maskUpdatePromise = processCoordinateSegmentation(video, participantId, 'person');
  const cachedMask = getCachedMask(participantId, 'person');
  
  if (cachedMask && cachedMask.maskCanvas) {
    applyMasking(ctx, video, cachedMask, width, height, flipHorizontal, filterValue);
  } else {
    applyOriginalRender(ctx, video, width, height, flipHorizontal, filterValue);
  }
  
  maskUpdatePromise.catch(() => {});
};

/**
 * 🆕 얼굴만 렌더링
 */
const renderFaceOnly = async (ctx, video, width, height, participantId, flipHorizontal, filterValue) => {
  const maskUpdatePromise = processCoordinateSegmentation(video, participantId, 'face');
  const cachedMask = getCachedMask(participantId, 'face');

  if (cachedMask && cachedMask.maskCanvas) {
    ctx.clearRect(0, 0, width, height);
    applyMasking(ctx, video, cachedMask, width, height, flipHorizontal, filterValue);
  } else {
    //얼굴인식실패
    // ctx.clearRect(0, 0, width, height);
  }
  maskUpdatePromise.catch(() => {});
};

/**
 * 🎯 마스킹 적용
 */
const applyMasking = (ctx, video, maskData, width, height, flipHorizontal, filterValue) => {
  ctx.filter = filterValue || 'none';
  
  // 비디오 그리기
  if (flipHorizontal) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, width, height);
  }
  
  // 마스크 적용
  ctx.globalCompositeOperation = 'destination-in';
  if (flipHorizontal) {
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(maskData.maskCanvas, 0, 0, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(maskData.maskCanvas, 0, 0, width, height);
  }
  
  ctx.globalCompositeOperation = 'source-over';
};

/**
 * 🚨 폴백 렌더링
 */
const renderFallback = (ctx, video, x, y, width, height, rotation, opacity, flipHorizontal) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  
  if (rotation !== 0) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    
    if (flipHorizontal) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -width / 2, -height / 2, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(video, -width / 2, -height / 2, width, height);
    }
  } else {
    if (flipHorizontal) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      ctx.drawImage(video, x, y, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(video, x, y, width, height);
    }
  }
  
  ctx.restore();
};

/**
 * 🔄 참가자별 MediaPipe 인스턴스 가져오기 또는 생성
 */
const getOrCreateMediaPipeInstance = async (participantId, type = 'selfie') => {
  const instanceKey = `${participantId}_${type}`; // ✅ 다시 참가자별로 구분
  
  if (participantMediaPipeInstances.has(instanceKey)) {
    const instance = participantMediaPipeInstances.get(instanceKey);
    
    // 에러카운트가 쌓인 mediapipe instance는 재생성시도
    if (instance.errorCount >= 5 && type === 'face') {
      //console.log(`🔄 에러 누적으로 ${participantId}_${type} 인스턴스 재생성`);
      
      try {
        if (instance.instance && typeof instance.instance.close === 'function') {
          instance.instance.close();
        }
      } catch (error) {
        // 정리 오류 무시
      }
      
      participantMediaPipeInstances.delete(instanceKey);
      // 재생성을 위해 아래 로직으로 진행
    } else {
      return instance;
    }
  }
  
  // ✅ 인스턴스 수 제한 늘리기 (동시 처리 지원)
  if (participantMediaPipeInstances.size >= 13) {
    return null;
  }
  
  try {
    const { createSelfieSegmentation, createFaceMesh } = await import('../utils/mediaUtils');
    
    let instance = null;
    
    if (type === 'selfie') {
      instance = await createSelfieSegmentation({
        modelSelection: 0,
        selfieMode: true,
      });
    } else if (type === 'face') {
      instance = await createFaceMesh({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });
    }
    
    if (!instance) {
      throw new Error(`${type} MediaPipe 인스턴스 생성 실패`);
    }
    
    const mediaInstance = {
      instance: instance,
      isProcessing: false,
      errorCount: 0,
      type: type,
      lastSuccessTime: Date.now(),
    };
    
    participantMediaPipeInstances.set(instanceKey, mediaInstance);
    // //console.log(`✅ ${participantId}_${type} MediaPipe 인스턴스 생성 완료`);
    return mediaInstance;
    
  } catch (error) {
    //console.error(`❌ ${participantId}_${type} MediaPipe 인스턴스 생성 실패:`, error);
    return null;
  }
};

/**
 * 🎯 스케줄러 상태 정보 반환
 */
export const getSchedulerStatus = () => {
  return {
    participantQueue: [...segmentationScheduler.participantQueue],
    currentIndex: segmentationScheduler.currentIndex,
    isTwoPersonMode: segmentationScheduler.isTwoPersonMode,
    cachedCount: segmentationScheduler.cachedMasks.size,
    frameCount: segmentationScheduler.frameCount,
    globalProcessingCount,
  };
};

/**
 * 🎯 모든 캐시 정리
 */
export const clearAllCaches = () => {
  for (const [participantId, cached] of segmentationScheduler.cachedMasks) {
    Object.values(cached).forEach(modeCache => {
      if (modeCache.maskData && modeCache.maskData.maskCanvas) {
        modeCache.maskData.maskCanvas.remove();
      }
    });
  }
  
  segmentationScheduler.cachedMasks.clear();
  segmentationScheduler.participantQueue = [];
  segmentationScheduler.currentIndex = 0;
  
  for (const [instanceKey] of participantMediaPipeInstances) {
    const [participantId] = instanceKey.split('_');
    cleanupParticipantMediaPipe(participantId);
  }
};

/**
 * 🗑️ 참가자 MediaPipe 인스턴스 정리
 */
export const cleanupParticipantMediaPipe = (participantId) => {
  const selfieKey = `${participantId}_selfie`;
  const faceKey = `${participantId}_face`;
  
  [selfieKey, faceKey].forEach(key => {
    if (participantMediaPipeInstances.has(key)) {
      const mediaInstance = participantMediaPipeInstances.get(key);
      
      try {
        mediaInstance.isProcessing = false;
        if (mediaInstance.instance && typeof mediaInstance.instance.close === 'function') {
          mediaInstance.instance.close();
        }
      } catch (error) {
        // 무시
      }
      
      participantMediaPipeInstances.delete(key);
    }
  });
  
  // 마스크 캐시에서도 제거
  const cached = segmentationScheduler.cachedMasks.get(participantId);
  if (cached) {
    Object.values(cached).forEach(modeCache => {
      if (modeCache.maskData && modeCache.maskData.maskCanvas) {
        modeCache.maskData.maskCanvas.remove();
      }
    });
    segmentationScheduler.cachedMasks.delete(participantId);
  }
};

// ========== 기존 유틸리티 함수들 ==========

const validateVideoForSegmentation = (video, participantId) => {
  if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    return false;
  }
  
  const maxDimension = 1920;
  if (video.videoWidth > maxDimension || video.videoHeight > maxDimension) {
    return false;
  }
  
  return true;
};

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
};

/**
 * FaceMesh 랜드마크에서 눈 위치 및 얼굴 정보 추출
 */
const extractFaceOverlayInfo = (landmarks, canvasWidth, canvasHeight, overlayItem) => {
  if (!landmarks || landmarks.length === 0) {
    return null;
  }

  // MediaPipe FaceMesh 눈 관련 랜드마크 인덱스
  const LEFT_EYE_INDICES = [
    // 왼쪽 눈 (사용자 기준) - 실제로는 오른쪽에 보임
    33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
  ];
  
  const RIGHT_EYE_INDICES = [
    // 오른쪽 눈 (사용자 기준) - 실제로는 왼쪽에 보임  
    362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
  ];

  // 눈 중심점 계산
  const getEyeCenter = (eyeIndices) => {
    let sumX = 0, sumY = 0;
    let validPoints = 0;
    
    eyeIndices.forEach(index => {
      if (landmarks[index]) {
        sumX += landmarks[index].x;
        sumY += landmarks[index].y;
        validPoints++;
      }
    });
    
    if (validPoints === 0) return null;
    
    return {
      x: (canvasWidth - (sumX / validPoints) * canvasWidth), 
      y: (sumY / validPoints) * canvasHeight
    };
  };

  // 눈 크기 계산 (눈 너비)
  const getEyeWidth = (eyeIndices) => {
    const eyePoints = eyeIndices
      .map(index => landmarks[index])
      .filter(point => point);
    
    if (eyePoints.length < 4) return 0;
    
    // 눈의 가장 왼쪽과 오른쪽 점 찾기
    let minX = Math.min(...eyePoints.map(p => p.x));
    let maxX = Math.max(...eyePoints.map(p => p.x));
    
    return (maxX - minX) * canvasWidth;
  };

  const leftEyeCenter = getEyeCenter(LEFT_EYE_INDICES);
  const rightEyeCenter = getEyeCenter(RIGHT_EYE_INDICES);
  
  if (!leftEyeCenter || !rightEyeCenter) {
    return null;
  }

  // 두 눈 사이의 거리 및 각도 계산
  const eyeDistance = Math.sqrt(
    Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
    Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
  );

  // 얼굴 회전 각도 계산 (라디안)
  const faceAngle = Math.atan2(
    rightEyeCenter.y - leftEyeCenter.y,
    rightEyeCenter.x - leftEyeCenter.x
  );

  // ✅ 렌더링 설정 가져오기 (기본값 설정)
  const settings = overlayItem?.renderSettings || {
    xPosition: 'center',
    yPosition: 'center', 
    sizeMultiplier: 2.1,
    aspectRatio: 2.0,
    yOffset: 0,
  };

  // ✅ X 위치 계산
  let centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2; // 기본: 두 눈 중점
  if (settings.xPosition === 'left') {
    centerX = leftEyeCenter.x;
  } else if (settings.xPosition === 'right') {
    centerX = rightEyeCenter.x;
  }

  let xOffset = overlayItem?.renderSettings.xOffset||0;
  centerX += settings.xOffset;

  // ✅ Y 위치 계산
  let centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2; // 기본: 두 눈 중점
  if (settings.yPosition === 'top') {
    centerY = Math.min(leftEyeCenter.y, rightEyeCenter.y); // 더 높은 눈 위치
  } else if (settings.yPosition === 'bottom') {
    centerY = Math.max(leftEyeCenter.y, rightEyeCenter.y) + eyeDistance * 0.3; // 아래쪽
  }
  
  // Y축 오프셋 적용
  centerY += settings.yOffset;

  const sunglassesCenter = { x: centerX, y: centerY };

  // 눈 크기를 기반으로 오버레이 크기 계산
  const leftEyeWidth = getEyeWidth(LEFT_EYE_INDICES);
  const rightEyeWidth = getEyeWidth(RIGHT_EYE_INDICES);
  const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;
  
  // 오버레이 크기 계산 (배율 설정 적용)
  const sunglassesWidth = eyeDistance * settings.sizeMultiplier;
  const sunglassesHeight = sunglassesWidth  / settings.aspectRatio; // 가로세로 비율

  return {
    leftEye: leftEyeCenter,
    rightEye: rightEyeCenter,
    center: sunglassesCenter,
    width: sunglassesWidth,
    height: sunglassesHeight,
    angle: faceAngle,
    eyeDistance: eyeDistance,
    avgEyeWidth: avgEyeWidth,
  };
};

/**
 * 오버레이 이미지 캐시 관리
 */
const overlayImageCache = new Map();

// 오버레이 전용 캐시 (기존 코드에 추가)
const overlayInfoCache = new Map();

// 오버레이 정보 캐싱
const setCachedOverlayInfo = (participantId, overlayInfo) => {
  overlayInfoCache.set(participantId, {
    overlayInfo: overlayInfo,
    timestamp: Date.now()
  });
};

// 캐시된 오버레이 정보 가져오기
const getCachedOverlayInfo = (participantId) => {
  const cached = overlayInfoCache.get(participantId);
  if (!cached) return null;
  
  const now = Date.now();
  const maxAge = 500; // 0.5초 캐시
  
  if (now - cached.timestamp > maxAge) {
    overlayInfoCache.delete(participantId);
    return null;
  }
  
  return cached.overlayInfo;
};

const loadOverlayImage = async (overlayUrl) => {
  if (overlayImageCache.has(overlayUrl)) {
    return overlayImageCache.get(overlayUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      overlayImageCache.set(overlayUrl, img);
      resolve(img);
    };
    
    img.onerror = () => {
      resolve(null);
    };
    
    img.src = overlayUrl + '?t=' + new Date().getTime();
  });
};

/**
 * 캔버스에 오버레이 렌더링
 */
const renderFaceOverlay = async (ctx, overlayInfo, overlayImage, flipHorizontal = false) => {
  if (!overlayInfo || !overlayImage) return;

  const { center, width, height, angle } = overlayInfo;

  ctx.save();
  // 수평 뒤집기 처리
  ctx.translate(center.x, center.y);
  ctx.scale(1, -1);
  ctx.rotate(-angle); // 각도도 반전

  // 선글라스 렌더링 (중심 기준)
  ctx.drawImage(
    overlayImage,
    -width / 2,   // x: 중심에서 왼쪽으로 절반
    -height / 2,  // y: 중심에서 위로 절반
    width,
    height
  );

  ctx.restore();
};

const faceDetectionFailureCount = new Map();
const faceDetectionSkipUntil = new Map();

/**
 * 얼굴 오버레이 처리 메인 함수
 */
export const processFaceOverlay = async (ctx, video, overlayItem, participantId, flipHorizontal = false) => {
  if (!overlayItem || overlayItem.id === 'none' || !overlayItem.overlayImage) {
    return false; // 오버레이 없음
  }
  
  //캐시 사용 시도
  const cachedOverlayInfo = getCachedOverlayInfo(participantId);
  if (cachedOverlayInfo) {
    try {
      const overlayImage = await loadOverlayImage(overlayItem.overlayImage);
      if (overlayImage) {
        await renderFaceOverlay(ctx, cachedOverlayInfo, overlayImage, flipHorizontal);
        return true;
      }
    } catch (error) {
      // 캐시 사용 실패, 아래로 진행
    }
  }

  const now = Date.now();
  const skipUntil = faceDetectionSkipUntil.get(participantId);
  if (skipUntil && now < skipUntil) {
    return false; // 아직 스킵 시간
  }

  try {
    // 1. 얼굴 랜드마크 가져오기 (기존 face 모드 사용)
    const faceData = await processCoordinateSegmentation(video, participantId, 'face');
    
    //얼굴 인식 실패시
    if (!faceData || !faceData.landmarks) {
      //오류카운트 추가
      const failureCount = (faceDetectionFailureCount.get(participantId) || 0) + 1;
      faceDetectionFailureCount.set(participantId, failureCount);
      //10frame이상 실패?
      if (failureCount >= 10) {
        faceDetectionSkipUntil.set(participantId, now + 500*failureCount); // n초 후까지 스킵
        faceDetectionFailureCount.set(participantId, 0); // 카운터 리셋
      }

      return false;
    }
    //성공시 실패기록 삭제
    faceDetectionFailureCount.delete(participantId);
    faceDetectionSkipUntil.delete(participantId);

    // 2. 오버레이 이미지 로드
    const overlayImage = await loadOverlayImage(overlayItem.overlayImage);
    if (!overlayImage) {
      return false; // 이미지 로드 실패
    }

    // 3. 얼굴에서 오버레이 정보 추출
    const overlayInfo = extractFaceOverlayInfo(
      faceData.landmarks, 
      ctx.canvas.width, 
      ctx.canvas.height,
      overlayItem, 
    );

    if (!overlayInfo) {
      return false; // 눈 위치 추출 실패
    }

    // 4. 오버레이 렌더링
    setCachedOverlayInfo(participantId, overlayInfo); //  캐싱 추가
    await renderFaceOverlay(ctx, overlayInfo, overlayImage, flipHorizontal);
    
    return true; // 성공
    
  } catch (error) {
    //console.warn('얼굴 오버레이 처리 실패:', error);
    return false;
  }
};

/**
 * 🧹 오버레이 캐시 정리
 */
export const clearOverlayCache = () => {
  overlayImageCache.clear();
  //console.log('🧹 오버레이 이미지 캐시 정리 완료');
};

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

export const mapCameraModeToString = (cameraMode) => {
  const modeMap = {
    1: 'original',
    2: 'person',
    3: 'face',
  };
  return modeMap[cameraMode] || 'original';
};