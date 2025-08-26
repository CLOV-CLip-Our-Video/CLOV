/* eslint-disable */
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import useVideoEffects from '../../../hooks/useVideoEffects';

/**
 * 🎨 비디오 이펙트 캔버스 컴포넌트
 * RecordingRoom에서 사용할 수 있는 재사용 가능한 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {HTMLVideoElement} props.videoElement - 비디오 요소
 * @param {number} props.width - 캔버스 너비 (기본값: 640)
 * @param {number} props.height - 캔버스 높이 (기본값: 480)
 * @param {string} props.className - 추가 CSS 클래스
 * @param {Function} props.onStateChange - 상태 변경 콜백
 * @param {boolean} props.autoStart - 자동 시작 여부 (기본값: true)
 */
const VideoEffectsCanvas = forwardRef(({
  videoElement,
  width = 640,
  height = 480,
  className = '',
  onStateChange = () => {},
  autoStart = true,
}, ref) => {
  
  const canvasRef = useRef(null);
  
  // useVideoEffects 훅 사용
  const videoEffects = useVideoEffects({
    videoElement,
    canvasElement: canvasRef.current,
    autoStart: autoStart && !!(videoElement && canvasRef.current),
    onStateChange,
  });
  
  // Ref 전달
  useImperativeHandle(ref, () => ({
    // 캔버스 요소
    canvas: canvasRef.current,
    
    // 스냅샷 캡처
    captureSnapshot: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      try {
        return canvas.toDataURL('image/png');
      } catch (error) {
        /* console.error('❌ [VideoEffectsCanvas] 스냅샷 캡처 실패:', error); */
        return null;
      }
    },
    
    // 준비 상태 확인
    isReady: videoEffects.isInitialized && videoEffects.aiModelsLoaded,
    
    // 비디오 이펙트 훅 접근
    videoEffects,
    
    // 제어 함수들
    start: videoEffects.start,
    stop: videoEffects.stop,
    restart: videoEffects.restart,
    
    // 상태 정보
    getState: () => ({
      isInitialized: videoEffects.isInitialized,
      isProcessing: videoEffects.isProcessing,
      error: videoEffects.error,
      aiModelsLoaded: videoEffects.aiModelsLoaded,
      faceDetectionReady: videoEffects.faceDetectionReady,
      segmentationMode: videoEffects.segmentationMode,
      modeInfo: videoEffects.modeInfo,
      selectedFilter: videoEffects.selectedFilter,
      canvasOpacity: videoEffects.canvasOpacity,
      canvasScale: videoEffects.canvasScale,
    }),
  }));
  
  // 비디오 요소 변경 시 재시작
  useEffect(() => {
    if (autoStart && videoElement && canvasRef.current && videoEffects.isInitialized) {
      videoEffects.restart();
    }
  }, [videoElement, autoStart, videoEffects]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        backgroundColor: 'transparent',
        display: 'block',
      }}
    />
  );
});

VideoEffectsCanvas.displayName = 'VideoEffectsCanvas';
export default VideoEffectsCanvas;