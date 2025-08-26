/* eslint-disable */
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import styles from './VideoPreview.module.css';

// Hooks
import useCamera from '../../../../hooks/useCamera';

// Stores
import useCameraStore from '../../../../stores/cameraStore';
import useVideoEffectsStore from '../../../../stores/videoEffectsStore';

// Components
import Button from '../../../../components/common/Button/Button';

// Utils
import { applyFilterToCanvas } from '../../../../utils/videoFilters';
import {
  mapCameraModeToString,
  getSegmentationModeInfo,
  setupCanvasSize,
} from '../../../../utils/segmentationUtils';
import {
  createSelfieSegmentation,
  cleanupSelfieSegmentation,
  loadBlazeFace,
} from '../../../../utils/mediaUtils';

const VideoPreview = forwardRef(
  (
    {
      className = '',
      showOverlay = true,
      transparentBackground = false,
      onEffectsChange = () => {},
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const selfieSegmentationRef = useRef(null);
    const blazefaceModelRef = useRef(null);
    const processingRef = useRef(false);
    const animationFrameRef = useRef(null);
    const segmentationResultRef = useRef(null);
    const segmentationReadyRef = useRef(false);

    const [error, setError] = useState(null);
    const [aiLoaded, setAiLoaded] = useState(false);
    const [faceDetectionReady, setFaceDetectionReady] = useState(false);

    // useCamera 훅 사용
    const {
      videoRef,
      currentStream,
      isLoading,
      startCamera,
      stopCamera,
      hardToggleCamera,
      needsUserGesture,
    } = useCamera({
      autoStart: true,
      defaultMicOn: false,
    });

    // Stores
    const {
      isVideoEnabled,
      setVideoEnabled,
      cameraMode,
      transparency,
      // 🔄 변경: setProcessedStream 제거 (더 이상 후처리된 스트림 생성하지 않음)
    } = useCameraStore();

    const { selectedFilter, canvasScale } = useVideoEffectsStore();

    // 현재 세그멘테이션 모드
    const segmentationMode = mapCameraModeToString(cameraMode);
    const modeInfo = getSegmentationModeInfo(segmentationMode);

    // Ref 전달
    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,
      captureSnapshot: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        try {
          return canvas.toDataURL('image/png');
        } catch (error) {
          /* console.error('❌ 스냅샷 캡처 실패:', error); */
          return null;
        }
      },
      isReady: !isLoading && isVideoEnabled && aiLoaded && currentStream,
      getProcessingState: () => ({
        segmentationMode,
        aiLoaded,
        faceDetectionReady,
        hasStream: !!currentStream,
      }),
    }));

    // 🔧 안전한 정리 함수
    const cleanup = () => {
      // /* console.log('🧹 리소스 정리 시작'); */

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (selfieSegmentationRef.current) {
        try {
          cleanupSelfieSegmentation(selfieSegmentationRef.current);
        } catch (cleanupError) {
          console.warn(
            '⚠️ MediaPipe 정리 중 오류 (무시):',
            cleanupError.message
          );
        }
        selfieSegmentationRef.current = null;
      }

      blazefaceModelRef.current = null;
      processingRef.current = false;
      segmentationResultRef.current = null;
      segmentationReadyRef.current = false;

      // 🔄 변경: 후처리된 스트림 정리 제거 (더 이상 생성하지 않음)

      // /* console.log('✅ 리소스 정리 완료'); */
    };

    // 🟢 HTML 방식의 세그멘테이션 처리 함수 (미리보기용만)
    const drawSegmentedParticipant = useCallback(async (video, canvas) => {
      if (!video || video.readyState < 2 || !selfieSegmentationRef.current)
        return;

      const width = video.videoWidth || 320;
      const height = video.videoHeight || 240;

      try {
        // MediaPipe에 프레임 전달
        segmentationReadyRef.current = false;
        await selfieSegmentationRef.current.send({ image: video });

        // 처리 완료될 때까지 대기 (최대 10프레임)
        for (let i = 0; i < 10 && !segmentationReadyRef.current; i++) {
          await new Promise((resolve) => setTimeout(resolve, 16));
        }

        if (
          !segmentationResultRef.current ||
          !segmentationResultRef.current.segmentationMask
        ) {
          /* console.warn('⚠️ 세그멘테이션 결과 없음, 원본 그리기'); */
          // 세그멘테이션 실패 시 원본 그리기
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.scale(-1, 1); // 좌우 반전
          ctx.translate(-canvas.width, 0);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
          return;
        }

        // 🟢 HTML 코드와 동일한 마스크 합성 로직 (미리보기용)
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        const tmpCtx = tmpCanvas.getContext('2d');

        // 1. 원본 비디오 그리기 (좌우 반전 적용)
        tmpCtx.save();
        tmpCtx.scale(-1, 1);
        tmpCtx.translate(-tmpCanvas.width, 0);
        tmpCtx.drawImage(video, 0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.restore();

        // 2. 마스크로 사람 부분만 남기기 (destination-in)
        tmpCtx.globalCompositeOperation = 'destination-in';

        // 마스크도 좌우 반전 적용
        tmpCtx.save();
        tmpCtx.translate(tmpCanvas.width, 0);
        tmpCtx.scale(-1, 1);
        tmpCtx.drawImage(
          segmentationResultRef.current.segmentationMask,
          0,
          0,
          tmpCanvas.width,
          tmpCanvas.height
        );
        tmpCtx.restore();

        // 3. 최종 캔버스에 출력
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tmpCanvas, 0, 0);
      } catch (error) {
        /* console.error('❌ 세그멘테이션 처리 오류:', error); */
        // 오류 발생 시 원본 그리기
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }, []);

    // 🟢 원본 모드 처리 함수
    const drawOriginalVideo = useCallback((video, canvas) => {
      if (!video || video.readyState < 2) return;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 좌우 반전 적용
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }, []);

    // 🤖 AI 모델 초기화
    useEffect(() => {
      const initAIModels = async () => {
        try {
          setError(null);
          setAiLoaded(false);

          // /* console.log('🤖 AI 모델 초기화 시작 (미리보기용)'); */

          // MediaPipe SelfieSegmentation 초기화
          if (!selfieSegmentationRef.current) {
            // /* console.log('🎭 MediaPipe SelfieSegmentation 생성 중...'); */
            const selfieSegmentation = await createSelfieSegmentation({
              modelSelection: 1,
              selfieMode: true,
            });

            if (!selfieSegmentation) {
              throw new Error('MediaPipe 인스턴스 생성 실패');
            }

            // onResults 핸들러
            selfieSegmentation.onResults((results) => {
              segmentationResultRef.current = results;
              segmentationReadyRef.current = true;
            });

            selfieSegmentationRef.current = selfieSegmentation;
            // /* console.log('✅ MediaPipe 초기화 완료 (미리보기용)'); */
          }

          // 얼굴 모드용 BlazeFace 초기화 (필요시)
          if (segmentationMode === 'face' && !blazefaceModelRef.current) {
            /* console.log('😀 얼굴 모드 감지 - BlazeFace 로딩 시작'); */
            try {
              const blazeface = await loadBlazeFace();
              if (blazeface) {
                blazefaceModelRef.current = blazeface;
                setFaceDetectionReady(true);
                /* console.log('✅ BlazeFace 로딩 완료'); */
              }
            } catch (blazeError) {
              console.warn(
                '⚠️ BlazeFace 로딩 실패, 전신 누끼로 대체:',
                blazeError.message
              );
              setFaceDetectionReady(false);
            }
          }

          setAiLoaded(true);
          // /* console.log('🎉 AI 모델 초기화 완료 (미리보기용)'); */
        } catch (error) {
          /* console.error('❌ AI 모델 초기화 실패:', error); */
          setError(`AI 모델 로딩 실패: ${error.message}`);
          setAiLoaded(false);
        }
      };

      if (!selfieSegmentationRef.current) {
        initAIModels();
      }

      return cleanup;
    }, []);

    // 📷 컴포넌트 마운트 시 카메라 시작
    useEffect(() => {
      const initCamera = async () => {
        try {
          // /* console.log('📷 카메라 시작'); */
          await startCamera();
          setVideoEnabled(true);
        } catch (error) {
          /* console.error('❌ 카메라 시작 실패:', error); */
          setError(`카메라 시작 실패: ${error.message}`);
        }
      };

      initCamera();

      return () => {
        stopCamera();
      };
    }, []);

    // 🎥 메인 비디오 처리 루프 (미리보기용만)
    useEffect(() => {
      // 조건 체크를 더 자주 실행하도록 수정
      const checkAndStartProcessing = () => {
        if (
          !currentStream ||
          !videoRef.current ||
          !canvasRef.current ||
          !aiLoaded
        ) {
          // 조건이 맞지 않으면 다음 프레임에서 다시 체크
          if (currentStream && aiLoaded) {
            requestAnimationFrame(checkAndStartProcessing);
          }
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // 캔버스 설정
        setupCanvasSize(canvas, 640, 480);

        // 🟢 배경은 투명하게 (누끼 처리 시 배경 없음)
        canvas.style.background = 'transparent';
        canvas.style.backgroundColor = 'transparent';

        // 초기 스타일 적용 (투명도, 크기, 필터)
        canvas.style.opacity = transparency / 100;
        const scaleValue = canvasScale / 100;
        canvas.style.transform = `scale(${scaleValue})`;
        canvas.style.transformOrigin = 'center center';
        applyFilterToCanvas(canvas, selectedFilter);

        // console.log(
        //   '🎥 비디오 미리보기 처리 시작 - 모드:',
        //   segmentationMode,

        // );

        // 🟢 애니메이션 루프 (미리보기용)
        const animate = async () => {
          if (!video || video.readyState < 2 || !canvas) {
            if (currentStream) {
              animationFrameRef.current = requestAnimationFrame(animate);
            }
            return;
          }

          if (video.videoWidth === 0 || video.videoHeight === 0) {
            if (currentStream) {
              animationFrameRef.current = requestAnimationFrame(animate);
            }
            return;
          }

          try {
            if (segmentationMode === 'original') {
              drawOriginalVideo(video, canvas);
            } else {
              await drawSegmentedParticipant(video, canvas);
            }
          } catch (processError) {
            /* console.error('❌ 프레임 처리 오류:', processError.message); */
          }

          if (currentStream) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        // 비디오가 준비되면 애니메이션 시작
        if (video.readyState >= 2) {
          animate();
        } else {
          video.addEventListener(
            'loadedmetadata',
            () => {
              animate();
            },
            { once: true }
          );
        }
      };

      // 즉시 체크 시작
      checkAndStartProcessing();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }, [
      currentStream,
      aiLoaded,
      segmentationMode,
      transparency,
      canvasScale,
      selectedFilter,
      drawSegmentedParticipant,
      drawOriginalVideo,
    ]);

    // 🔄 변경: 후처리된 스트림 생성 및 등록 로직 제거

    // 🎨 필터와 투명도, 크기 적용
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // /* console.log('🎨 필터 적용:', selectedFilter?.name || '없음'); */

      // CSS 필터 적용
      applyFilterToCanvas(canvas, selectedFilter);

      // 캔버스 투명도 적용
      canvas.style.opacity = transparency / 100;

      // 캔버스 크기 적용
      const scaleValue = canvasScale / 100;
      canvas.style.transform = `scale(${scaleValue})`;
      canvas.style.transformOrigin = 'center center';
    }, [selectedFilter, transparency, canvasScale]);

    // 🎨 캔버스가 준비된 후 즉시 스타일 적용
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 캔버스 스타일을 즉시 적용
      canvas.style.opacity = transparency / 100;
      const scaleValue = canvasScale / 100;
      canvas.style.transform = `scale(${scaleValue})`;
      canvas.style.transformOrigin = 'center center';
      applyFilterToCanvas(canvas, selectedFilter);

      // console.log('🎨 VideoPreview 캔버스 준비 후 스타일 즉시 적용:', {
      //   transparency,
      //   opacity: transparency / 100
      // });
    }, [canvasRef.current]); // 캔버스 ref가 변경될 때마다

    // 📊 설정 변경 알림
    useEffect(() => {
      onEffectsChange({
        segmentationMode,
        selectedFilterName: selectedFilter?.name ?? 'none', //객체 참조는 변화가능하기때문에 불필요한 useEffect가 호출되고있었음.
        transparency,
        canvasScale,
      });
    }, [
      segmentationMode,
      selectedFilter,
      transparency,
      canvasScale,
      onEffectsChange,
    ]);

    // // 📷 카메라 토글
    // const handleToggleCamera = async () => {
    //   try {
    //     await startCamera();
    //     setVideoEnabled(!currentStream);
    //   } catch (error) {
    //     /* console.error('❌ 카메라 토글 실패:', error); */
    //   }
    // };

    // 로딩 상태 렌더링
    if (isLoading || !aiLoaded) {
      return (
        <div className={`${styles.container} ${className}`}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <h3 className={styles.loadingTitle}>
              {isLoading ? '📷 카메라 준비 중...' : '🤖 AI 모델 로딩 중...'}
            </h3>
            <p className={styles.loadingText}>
              {isLoading
                ? '카메라 권한을 확인하고 있습니다.'
                : 'MediaPipe 세그멘테이션 모델을 로드하고 있습니다. (미리보기용)'}
            </p>
          </div>
        </div>
      );
    }

    // 에러 상태 렌더링
    if (error) {
      return (
        <div className={`${styles.container} ${className}`}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>🚫</div>
            <h3 className={styles.errorTitle}>오류 발생</h3>
            <p className={styles.errorText}>{error}</p>
            <Button
              variant='primary'
              size='medium'
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              다시 시도
            </Button>
          </div>
        </div>
      );
    }

    // 카메라가 꺼진 상태
    if (!currentStream) {
      return (
        <div className={`${styles.container} ${className}`}>
          <div className={styles.cameraOffState}>
            <div className={styles.cameraOffIcon}>📷</div>
            <h3 className={styles.cameraOffTitle}>카메라가 꺼져 있습니다</h3>
            <Button
              variant='primary'
              size='medium'
              onClick={() => startCamera({ video: true, audio: false })}
              className={styles.turnOnButton}
            >
              📷 카메라 켜기
            </Button>
          </div>
        </div>
      );
    }

    // 정상 작동 상태
    return (
      <div className={`${styles.container} ${className}`}>
        {/* 비디오 요소 (숨김) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.hiddenVideo}
        />

        {/* 캔버스 (미리보기용 세그멘테이션 결과) */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={styles.mainCanvas}
          style={{
            background: 'transparent',
            imageRendering: 'auto',
          }}
        />

        {/* 하단 컨트롤 */}
        {showOverlay && (
          <div className={styles.controls}>
            <Button
              variant={currentStream ? 'secondary' : 'primary'}
              size='small'
              onClick={hardToggleCamera}
              className={styles.controlButton}
            >
              {currentStream ? '📷 끄기' : '📷 켜기'}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

VideoPreview.displayName = 'VideoPreview';
export default VideoPreview;
