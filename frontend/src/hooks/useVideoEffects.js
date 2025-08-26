/* eslint-disable */
// hooks/useVideoEffects.js - 비디오 이펙트 통합 관리 훅

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import useCameraStore from '../stores/cameraStore';
import useVideoEffectsStore from '../stores/videoEffectsStore';

// Utils
import { 
  loadBlazeFace,
  createSelfieSegmentation,
  cleanupSelfieSegmentation,
  setupMediaPipeResults,
  sendVideoToMediaPipe,
} from '../utils/mediaUtils';

import {
  renderOriginalVideo,
  processSegmentation,
  mapCameraModeToString,
  getSegmentationModeInfo,
  setupCanvasSize,
  setupCanvasBackground,
  validateSegmentationConfig
} from '../utils/segmentationUtils';

import { applyFilterToCanvas } from '../utils/videoFilters';

/**
 * 🎨 비디오 이펙트 통합 관리 훅
 * WaitingRoom과 RecordingRoom에서 공통으로 사용할 수 있는 훅
 * 
 * @param {Object} options - 옵션 객체
 * @param {HTMLVideoElement} options.videoElement - 비디오 요소
 * @param {HTMLCanvasElement} options.canvasElement - 캔버스 요소
 * @param {boolean} options.autoStart - 자동 시작 여부 (기본값: true)
 * @param {Function} options.onStateChange - 상태 변경 콜백
 * @returns {Object} 훅 반환값
 */
export default function useVideoEffects({
  videoElement,
  canvasElement,
  autoStart = true,
  onStateChange = () => {},
} = {}) {
  
  // Refs
  const selfieSegmentationRef = useRef(null);
  const blazefaceModelRef = useRef(null);
  const processingRef = useRef(false);
  const animationFrameRef = useRef(null);
  
  // States
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [aiModelsLoaded, setAiModelsLoaded] = useState(false);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  
  // Stores
  const { cameraMode } = useCameraStore();
  const { 
    selectedFilter, 
    canvasOpacity,
    canvasScale,
  } = useVideoEffectsStore();
  
  // 현재 세그멘테이션 모드
  const segmentationMode = mapCameraModeToString(cameraMode);
  
  // modeInfo를 useMemo로 메모이제이션
  const modeInfo = useMemo(() => {
    return getSegmentationModeInfo(segmentationMode);
  }, [segmentationMode]);
  
  // 🧹 정리 함수
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (selfieSegmentationRef.current) {
      cleanupSelfieSegmentation(selfieSegmentationRef.current);
      selfieSegmentationRef.current = null;
    }
    
    blazefaceModelRef.current = null;
    processingRef.current = false;
    setIsProcessing(false);
  }, []);
  
  
  // 🎥 비디오 프레임 처리
  const processVideoFrame = useCallback(async () => {
    if (!videoElement || !canvasElement || !aiModelsLoaded || processingRef.current) {
      return;
    }
    
    if (videoElement.readyState < 2) {
      return;
    }
    
    processingRef.current = true;
    setIsProcessing(true);
    
    try {
      const ctx = canvasElement.getContext('2d');
      
      if (segmentationMode === 'original') {
        // 원본 모드 - MediaPipe 없이 직접 그리기
        renderOriginalVideo(videoElement, ctx);
      } else if (selfieSegmentationRef.current && videoElement.videoWidth > 0) {
        // MediaPipe 세그멘테이션 모드
        const success = await sendVideoToMediaPipe(selfieSegmentationRef.current, videoElement);
        if (!success) {
          // 전송 실패 시 원본으로 대체
          renderOriginalVideo(videoElement, ctx);
        }
      }
      
    } catch (error) {
      /* console.error('❌ [useVideoEffects] 프레임 처리 오류:', error); */
      // 오류 발생 시 원본 모드로 대체
      try {
        const ctx = canvasElement.getContext('2d');
        if (ctx) {
          renderOriginalVideo(videoElement, ctx);
        }
      } catch (fallbackError) {
        /* console.error('❌ [useVideoEffects] 원본 모드 대체도 실패:', fallbackError.message); */
      }
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [videoElement, canvasElement, aiModelsLoaded, segmentationMode]);
  
  // 🎨 필터와 스타일 적용
  const applyEffects = useCallback(() => {
    if (!canvasElement) return;
    
    // CSS 필터 적용
    applyFilterToCanvas(canvasElement, selectedFilter);
    
    // 캔버스 투명도 적용
    canvasElement.style.opacity = canvasOpacity / 100;
    
    // 캔버스 크기 적용
    const scaleValue = canvasScale / 100;
    canvasElement.style.transform = `scale(${scaleValue})`;
    canvasElement.style.transformOrigin = 'center center';
  }, [canvasElement, selectedFilter, canvasOpacity, canvasScale]);
  
  // 🚀 초기화 및 시작
  const start = useCallback(async () => {
    if (!videoElement || !canvasElement) {
      /* console.warn('❌ [useVideoEffects] 비디오 또는 캔버스 요소가 없습니다'); */
      return false;
    }
    
    try {
      // 캔버스 설정
      setupCanvasSize(canvasElement, 640, 480);
      setupCanvasBackground(canvasElement, segmentationMode);
      
      // AI 모델 초기화
      try {
        cleanup();
        setError(null);
        
        /* console.log('🤖 [useVideoEffects] AI 모델 초기화 시작'); */
        
        // 1. MediaPipe SelfieSegmentation 초기화
        const selfieSegmentation = await createSelfieSegmentation({
          modelSelection: 1 // 정확도 우선 모델
        });
        
        if (!selfieSegmentation) {
          throw new Error('MediaPipe 인스턴스 생성 실패');
        }
        
        selfieSegmentationRef.current = selfieSegmentation;
        /* console.log('✅ [useVideoEffects] MediaPipe 초기화 완료'); */
        
        // 2. 얼굴 모드인 경우 BlazeFace 로딩
        if (segmentationMode === 'face') {
          /* console.log('😀 [useVideoEffects] 얼굴 모드 감지 - BlazeFace 로딩 시작'); */
          try {
            const blazeface = await loadBlazeFace();
            blazefaceModelRef.current = blazeface;
            setFaceDetectionReady(true);
            /* console.log('✅ [useVideoEffects] BlazeFace 로딩 완료'); */
          } catch (blazeError) {
            /* console.warn('⚠️ [useVideoEffects] BlazeFace 로딩 실패, 전신 누끼로 대체:', blazeError.message); */
            setFaceDetectionReady(false);
          }
        } else {
          setFaceDetectionReady(false);
        }
        
        setAiModelsLoaded(true);
        
        // MediaPipe 결과 핸들러 설정
        if (selfieSegmentationRef.current) {
          const mediaResHandler = async (results) => {
            if (processingRef.current || !canvasElement) return;
            
            processingRef.current = true;
            
            try {
              const ctx = canvasElement.getContext('2d');
              
              if (!ctx) {
                /* console.warn('❌ [useVideoEffects] 캔버스 컨텍스트 가져오기 실패'); */
                return;
              }
              
              // 설정 검증
              const validation = validateSegmentationConfig({
                mode: segmentationMode,
                canvas: canvasElement,
                video: videoElement
              });
              
              if (!validation.isValid) {
                /* console.warn('❌ [useVideoEffects] 세그멘테이션 설정 검증 실패:', validation.errors); */
                // 검증 실패 시 원본 모드로 대체
                renderOriginalVideo(videoElement, ctx);
                return;
              }
              
              // 세그멘테이션 처리
              await processSegmentation(
                segmentationMode,
                results,
                ctx,
                videoElement,
                blazefaceModelRef.current
              );
              
            } catch (processError) {
              /* console.error('❌ [useVideoEffects] MediaPipe 결과 처리 오류:', processError.message); */
              // 오류 발생 시 원본 모드로 대체
              try {
                const ctx = canvasElement?.getContext('2d');
                if (ctx && videoElement) {
                  renderOriginalVideo(videoElement, ctx);
                }
              } catch (fallbackError) {
                /* console.error('❌ [useVideoEffects] 원본 모드 대체도 실패:', fallbackError.message); */
              }
            } finally {
              processingRef.current = false;
            }
          };
          
          setupMediaPipeResults(selfieSegmentationRef.current, mediaResHandler, {
            enableErrorHandling: true,
            logErrors: false,
          });
        }
        
      } catch (aiError) {
        /* console.error('❌ [useVideoEffects] AI 모델 초기화 실패:', aiError); */
        setError(`AI 모델 로딩 실패: ${aiError.message}`);
        setAiModelsLoaded(false);
        throw aiError;
      }
      
      setIsInitialized(true);
      return true;
      
    } catch (error) {
      /* console.error('❌ [useVideoEffects] 초기화 실패:', error); */
      setError(error.message);
      return false;
    }
  }, [videoElement, canvasElement, segmentationMode]);
  
  // 🛑 정지
  const stop = useCallback(() => {
    cleanup();
    setIsInitialized(false);
    setAiModelsLoaded(false);
    setFaceDetectionReady(false);
    setError(null);
  }, [cleanup]);
  
  // 🔄 재시작
  const restart = useCallback(async () => {
    stop();
    return await start();
  }, [stop, start]);
  
  // 자동 시작
  useEffect(() => {
    if (autoStart && videoElement && canvasElement && !isInitialized) {
      start();
    }
  }, [autoStart, videoElement, canvasElement, isInitialized]);
  
  // 정리 함수 분리
  useEffect(() => {
    return cleanup;
  }, []);
  
  // 세그멘테이션 모드 변경 시 재초기화
  useEffect(() => {
    if (isInitialized) {
      restart();
    }
  }, [segmentationMode]);
  
  // 필터와 스타일 적용
  useEffect(() => {
    applyEffects();
  }, [selectedFilter, canvasOpacity, canvasScale]);
  
  // 상태 변경 알림
  useEffect(() => {
    onStateChange({
      segmentationMode,
      selectedFilter,
      canvasOpacity,
      canvasScale,
      modeInfo,
      isInitialized,
      isProcessing,
      aiModelsLoaded,
      faceDetectionReady,
      error,
    });
  }, [
    segmentationMode,
    selectedFilter,
    canvasOpacity,
    canvasScale,
    isInitialized,
    isProcessing,
    aiModelsLoaded,
    faceDetectionReady,
    error,
  ]);
  
  // 비디오 프레임 처리 루프
  useEffect(() => {
    if (!isInitialized || !aiModelsLoaded) return;
    
    const frameLoop = () => {
      processVideoFrame();
      animationFrameRef.current = requestAnimationFrame(frameLoop);
    };
    
    frameLoop();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isInitialized, aiModelsLoaded, processVideoFrame]);
  
  return {
    // 상태
    isInitialized,
    isProcessing,
    error,
    aiModelsLoaded,
    faceDetectionReady,
    
    // 현재 설정
    segmentationMode,
    modeInfo,
    selectedFilter,
    canvasOpacity,
    canvasScale,
    
    // 제어 함수
    start,
    stop,
    restart,
    
    // 유틸리티
    processVideoFrame,
    applyEffects,
    
    // 내부 참조 (디버깅용)
    refs: {
      selfieSegmentation: selfieSegmentationRef.current,
      blazeface: blazefaceModelRef.current,
    },
  };
}