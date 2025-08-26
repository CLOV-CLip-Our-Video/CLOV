// src/components/Recording/RecordingCanvas/RecordingCanvas.jsx
/* eslint-disable */
import {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import useCameraStore from '../../../stores/cameraStore';
import useRoomStore from '../../../stores/roomStore';
import useCanvasParticipantsStore from '../../../stores/canvasParticipantsStore';
import { useVideoEffectsStore, useRecordingStore } from '../../../stores';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { sendEvent } from '../../../services/socket';
import { ROTATION_SETTINGS } from '../../../utils/constants';

// 🎯 좌표 기반 세그멘테이션 유틸리티 임포트
import {
  renderStreamWithCachedMask,
  updateParticipantQueue,
  clearAllCaches,
  getSchedulerStatus,
  cleanupParticipantMediaPipe,
} from '../../../utils/optimizedSegmentationUtils';

// 🎯 터치 제스처 관련 임포트
import { useTouchGestures } from './hooks/useTouchGestures';

// 🔧 회전 각도 스냅 함수
const snapRotationAngle = (angle) => {
  const { SNAP_DEGREES } = ROTATION_SETTINGS;
  return Math.round(angle / SNAP_DEGREES) * SNAP_DEGREES;
};

// 🔍 디버깅용 로그 함수
const logRotationChange = (from, to, type = 'DRAG') => {
  if (from !== to) {
    // /* console.log(`🔄 회전 [${type}]: ${from}° → ${to}° (스냅: ${ROTATION_SETTINGS.SNAP_DEGREES}°)`); */
  }
};

// 🚨 설정 검증 함수 (개발 모드에서만)
const validateRotationSettings = () => {
  const { SNAP_DEGREES, MANUAL_ROTATION_DEGREES } = ROTATION_SETTINGS;

  if (360 % SNAP_DEGREES !== 0) {
    /* console.warn(`⚠️ SNAP_DEGREES(${SNAP_DEGREES})는 360의 약수가 아닙니다. 각도가 정확하지 않을 수 있습니다.`); */
  }

  if (MANUAL_ROTATION_DEGREES % SNAP_DEGREES !== 0) {
    /* console.warn(`⚠️ MANUAL_ROTATION_DEGREES(${MANUAL_ROTATION_DEGREES})는 SNAP_DEGREES(${SNAP_DEGREES})의 배수가 아닙니다.`); */
  }
};


// 🎯 간단한 상수 정의
const CAM_WIDTH = 160;
const CAM_HEIGHT = 120;

// 🎯 동적 크기 계산 - 핵심 로직만
const getCamSize = (videoElement, scale = 1.0) => {
  let width = CAM_WIDTH;
  let height = CAM_HEIGHT;
  
  // 세로 모드 감지
  if (videoElement?.readyState >= 2 && videoElement.videoHeight > videoElement.videoWidth) {
    width = CAM_HEIGHT; 
    height = CAM_WIDTH; 
  }
  
  return {
    width: width * scale,
    height: height * scale
  };
};

const RecordingCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const dragStateRef = useRef({
    isDragging: false,
    mode: null, // 'MOVE' | 'RESIZE_ROTATE'
    startMouseX: 0,
    startMouseY: 0,
    startRotation: 0,
    startScale: 1.0,
    centerX: 0,
    centerY: 0,
    initialDistance: 0,
    dragOffsetX: 0, // 기존 dragOffset 유지
    dragOffsetY: 0,
  });

  // AI 로딩 상태
  const [aiLoaded, setAiLoaded] = useState(false);

  // 배경 이미지 상태 관리
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const backgroundImageRef = useRef(null);

  const background = useRoomStore((s) => s.roomBackground);

  // 스토어 상태들
  const {
    localStream,
    cameraMode,
    transparency,
    rotation,
    setSize,
    setRotation,
    isMicOn,
    setTransparency,
  } = useCameraStore();
  const { clientId, roomCode } = useRoomStore();
  const { participantsState, updateParticipantState } =
    useCanvasParticipantsStore();
  const { selectedFilter, selectedOverlay } = useVideoEffectsStore();

  // RecordingStore
  const {
    takePhoto,
    startRecording,
    stopRecording,
    isRecording,
    isCountingDown,
    countdown,
  } = useRecordingStore();

  // WebRTC 훅 사용
  const {
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    connectToNewParticipant,
    peerConnectionsRef,
    disconnectParticipant,
    remoteVideoElements,
    createPeerConnection,
  } = useWebRTC();

  // 외부에서 호출할 수 있는 메서드들 노출
  useImperativeHandle(
    ref,
    () => ({
      capturePhoto: async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('캔버스를 찾을 수 없습니다.');
        }

        try {
          // /* console.log('📸 사진 촬영 시작...'); */
          const photoData = await takePhoto(canvas);
          // /* console.log('✅ 사진 촬영 완료:', photoData); */
          return photoData;
        } catch (error) {
          // /* console.error('❌ 사진 촬영 실패:', error); */
          throw error;
        }
      },

      startVideoRecording: () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('캔버스를 찾을 수 없습니다.');
        }

        try {
          ///* console.log('🎬 영상 녹화 시작...'); */
          startRecording(canvas);
          return true;
        } catch (error) {
          /* console.error('❌ 영상 녹화 시작 실패:', error); */
          throw error;
        }
      },

      stopVideoRecording: () => {
        try {
          /* console.log('🛑 영상 녹화 중지...'); */
          stopRecording();
          return true;
        } catch (error) {
          /* console.error('❌ 영상 녹화 중지 실패:', error); */
          throw error;
        }
      },

      getRecordingState: () => ({
        isRecording,
        isCountingDown,
        countdown,
      }),

      getSchedulerStatus: () => getSchedulerStatus(),
    }),
    [
      takePhoto,
      startRecording,
      stopRecording,
      isRecording,
      isCountingDown,
      countdown,
    ]
  );

  // 참가자 큐 업데이트 (참가자 변경 시)
  const allParticipantIds = useMemo(() => {
    const ids = Object.keys(participantsState);
    return ids;
  }, [participantsState]);

  useEffect(() => {
    if (allParticipantIds.length > 0) {
      updateParticipantQueue(allParticipantIds);
    }
  }, [allParticipantIds]);

  // 초기화
  useEffect(() => {
    const initCoordinateSegmentation = async () => {
      try {
        // /* console.log('🎯 좌표 기반 세그멘테이션 시스템 초기화 시작'); */

        // 🧪 회전 설정 검증
        if (process.env.NODE_ENV === 'development') {
          validateRotationSettings();
        }

        setAiLoaded(true);
        // /* console.log('✅ 좌표 기반 세그멘테이션 시스템 준비 완료'); */
      } catch (error) {
        /* console.error('❌ 좌표 기반 세그멘테이션 초기화 실패:', error); */
        setAiLoaded(false);
      }
    };

    initCoordinateSegmentation();

    return () => {
      // /* console.log('🗑️ RecordingCanvas 정리 중...'); */
      clearAllCaches();
    };
  }, []);

  // 초기 상태 전송 (rotation 포함)
  useEffect(() => {
    if (clientId && roomCode && aiLoaded && updateMyState) {
      /* console.log('📤 초기 캔버스 상태 전송 (rotation: 0 포함)'); */
      updateMyState({ rotation: 0 }); // rotation을 명시적으로 포함
    }
  }, [clientId, roomCode, aiLoaded]);

  // 참가자 플레이스홀더 그리기 함수
  const drawParticipantPlaceholder = useCallback(
    (ctx, x, y, width, height, nickname) => {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const radius = Math.min(width, height) / 2;

      // 반투명 원
      ctx.fillStyle = 'rgba(51, 51, 51, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // 테두리 그리기
      ctx.strokeStyle = 'rgba(102, 102, 102, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 닉네임 표시
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const displayName =
        nickname.length > 8 ? nickname.substring(0, 6) + '...' : nickname;
      ctx.fillText(displayName, centerX, centerY);
    },
    []
  );

  // 카운트다운 오버레이 그리기 함수
  const drawCountdownOverlay = useCallback(
    (ctx, canvasWidth, canvasHeight) => {
      if (!isCountingDown || countdown <= 0) return;

      // 반투명 배경
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 카운트다운 텍스트
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const fontSize = Math.min(canvasWidth, canvasHeight) / 4;

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = fontSize / 20;

      // 텍스트 그림자 효과
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 카운트 그리기
      ctx.strokeText(countdown.toString(), centerX, centerY);
      ctx.fillText(countdown.toString(), centerX, centerY);

      // 그림자 초기화
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    },
    [isCountingDown, countdown]
  );

  // 배경 이미지 로딩
  useEffect(() => {
    const loadBackgroundImage = async () => {
      if (!background?.backgroundUrl) {
        // /* console.log('🖼️ 배경 이미지 없음 - 기본 배경 사용'); */
        backgroundImageRef.current = null;
        setBackgroundImageLoaded(false);
        return;
      }

      const backgroundUrl = background.backgroundUrl;
      // /* console.log('🔄 배경 이미지 로딩 시작:', backgroundUrl); */

      try {
        if (backgroundImageRef.current) {
          backgroundImageRef.current = null;
        }
        setBackgroundImageLoaded(false);

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          // /* console.log('✅ 배경 이미지 로딩 완료:', backgroundUrl); */
          backgroundImageRef.current = img;
          setBackgroundImageLoaded(true);
        };

        img.onerror = (error) => {
          /* console.error('❌ 배경 이미지 로딩 실패:', backgroundUrl, error); */
          backgroundImageRef.current = null;
          setBackgroundImageLoaded(false);
        };

        img.src = backgroundUrl + '?timestamp=' + new Date().getTime();
      } catch (error) {
        /* console.error('❌ 배경 이미지 로딩 중 오류:', error); */
        backgroundImageRef.current = null;
        setBackgroundImageLoaded(false);
      }
    };

    loadBackgroundImage();
  }, [background?.backgroundUrl]);

  const myStyle = useMemo(() => {
    const baseStyle = participantsState[clientId] ?? {
      x: 100,
      y: 100,
      scale: 1.0,
      opacity: 1.0,
      mode: cameraMode,
      filter: selectedFilter?.name || null,
      rotation: rotation, // cameraStore의 rotation 사용
    };

    // cameraStore의 rotation을 우선적으로 사용
    return {
      ...baseStyle,
      rotation: rotation, // cameraStore의 rotation 값 사용
    };
  }, [participantsState, clientId, cameraMode, selectedFilter, rotation]);

  // 통합 상태 업데이트 함수 (WebSocket 이벤트 중복 방지 + RoomInfo 동기화)
  const updateMyState = useCallback(
    (newState) => {
      const completeState = {
        ...myStyle,
        ...newState,
        mode: cameraMode,
        filter: selectedFilter?.name || null,
        opacity: transparency / 100,
        isMicOn: isMicOn,
        overlay: selectedOverlay || null,
      };
      // console.log('📤 드레그중전송할 상태:', completeState.overlay); // 디버그 로그
      // RoomInfo 동기화: scale 변경 시 cameraStore의 size도 업데이트
      if (newState.scale !== undefined && newState.scale !== myStyle.scale) {
        const newSize = Math.round(newState.scale * 100); // scale(0.5-3.0) -> size(50-300)
        const clampedSize = Math.max(50, Math.min(200, newSize)); // RoomInfo 범위에 맞춤
        setSize(clampedSize);
      }

      updateParticipantState(clientId, completeState);

      sendEvent('update-state', {
        roomCode,
        clientId,
        state: completeState,
      });
    },
    [
      myStyle,
      clientId,
      roomCode,
      updateParticipantState,
      cameraMode,
      selectedFilter,
      selectedOverlay,
      transparency,
      setSize,
      isMicOn,
    ]
  );

  // 위치 업데이트 함수 (기존 호환성 유지)
  const updateMyPosition = useCallback(
    (newPosition) => {
      updateMyState(newPosition);
    },
    [updateMyState]
  );

  // 회전 각도 업데이트 함수 (cameraStore와 함께 업데이트)
  const updateMyRotation = useCallback(
    (newRotation) => {
      // 0-359도 범위로 정규화
      const normalizedRotation = ((newRotation % 360) + 360) % 360;

      // cameraStore 업데이트 (RoomInfo 동기화)
      setRotation(normalizedRotation);

      // WebSocket으로 상태 전송
      updateMyState({ rotation: normalizedRotation });
    },
    [updateMyState, setRotation]
  );

  // 🎯 터치 제스처 훅 사용 (모든 함수가 정의된 후에 호출)
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  } = useTouchGestures({
    myStyle,
    updateMyState,
    updateMyPosition,
    updateMyRotation,
    isCountingDown,
  });

  // 핸들 영역 체크 함수 (현재 시각적 우하단 모서리 기준 20x20px)
  const isInHandleArea = useCallback(
    (mouseX, mouseY, camX, camY, camWidth, camHeight, rotation = 0) => {
      const handleSize = 20;

      // 캠의 중심점 계산
      const centerX = camX + camWidth / 2;
      const centerY = camY + camHeight / 2;

      // 회전 각도를 라디안으로 변환
      const rotationRad = (rotation * Math.PI) / 180;

      // 캠의 4개 모서리 좌표 (중심 기준 상대 좌표)
      const corners = [
        { x: -camWidth / 2, y: -camHeight / 2 }, // 좌상단
        { x: camWidth / 2, y: -camHeight / 2 }, // 우상단
        { x: camWidth / 2, y: camHeight / 2 }, // 우하단
        { x: -camWidth / 2, y: camHeight / 2 }, // 좌하단
      ];

      // 각 모서리를 회전 변환
      const rotatedCorners = corners.map((corner) => ({
        x:
          centerX +
          (corner.x * Math.cos(rotationRad) - corner.y * Math.sin(rotationRad)),
        y:
          centerY +
          (corner.x * Math.sin(rotationRad) + corner.y * Math.cos(rotationRad)),
      }));

      // 시각적으로 가장 우하단에 있는 모서리 찾기 (x + y 값이 가장 큰 점)
      let bottomRightCorner = rotatedCorners[0];
      let maxSum = rotatedCorners[0].x + rotatedCorners[0].y;

      for (let i = 1; i < rotatedCorners.length; i++) {
        const sum = rotatedCorners[i].x + rotatedCorners[i].y;
        if (sum > maxSum) {
          maxSum = sum;
          bottomRightCorner = rotatedCorners[i];
        }
      }

      // 핸들러 영역 (시각적 우하단 모서리 기준)
      const handleX = bottomRightCorner.x - handleSize / 2;
      const handleY = bottomRightCorner.y - handleSize / 2;

      return (
        mouseX >= handleX &&
        mouseX <= handleX + handleSize &&
        mouseY >= handleY &&
        mouseY <= handleY + handleSize
      );
    },
    []
  );

  // 키보드 R/E키로 시계방향/반시계방향 45도 회전
  const rotateCamera = useCallback(() => {
    const currentRotation = myStyle.rotation || 0;
    const { MANUAL_ROTATION_DEGREES } = ROTATION_SETTINGS;
    const rawRotation = (currentRotation + MANUAL_ROTATION_DEGREES) % 360;
    const snappedRotation = snapRotationAngle(rawRotation);

    logRotationChange(currentRotation, snappedRotation, 'MANUAL');
    updateMyRotation(snappedRotation);
  }, [myStyle.rotation, updateMyRotation]);

  const rotateCameraCounterClockwise = useCallback(() => {
    const currentRotation = myStyle.rotation || 0;
    const { MANUAL_ROTATION_DEGREES } = ROTATION_SETTINGS;
    const rawRotation = (currentRotation - MANUAL_ROTATION_DEGREES) % 360;
    const snappedRotation = snapRotationAngle(rawRotation);

    logRotationChange(currentRotation, snappedRotation, 'MANUAL');
    updateMyRotation(snappedRotation);
  }, [myStyle.rotation, updateMyRotation]);

  // 키보드 Q/W키로 축소/확대
  const scaleCamera = useCallback(
    (isZoomIn) => {
      const currentScale = myStyle.scale || 1.0;
      const scaleStep = 0.1; // 10%씩 조절
      const newScale = isZoomIn
        ? Math.min(2.0, currentScale + scaleStep) // 최대 2배
        : Math.max(0.5, currentScale - scaleStep); // 최소 0.5배

      if (newScale !== currentScale) {
        // 중심점 유지를 위한 위치 보정
        // const oldWidth = 161 * currentScale;
        // const oldHeight = 121 * currentScale;
        // const newWidth = 161 * newScale;
        // const newHeight = 121 * newScale;
        const { width: oldWidth, height: oldHeight } = getCamSize(videoRef.current, currentScale);
        const { width: newWidth, height: newHeight } = getCamSize(videoRef.current, newScale);

        const centerX = myStyle.x + oldWidth / 2;
        const centerY = myStyle.y + oldHeight / 2;
        const newX = centerX - newWidth / 2;
        const newY = centerY - newHeight / 2;

        updateMyState({
          x: newX,
          y: newY,
          scale: newScale,
        });
      }
    },
    [myStyle, updateMyState]
  );

  // 키보드 D/F키로 투명도 감소/증가
  const changeTransparency = useCallback(
    (isIncrease) => {
      const currentTransparency = transparency;
      const newTransparency = isIncrease
        ? Math.min(100, currentTransparency + 10)
        : Math.max(10, currentTransparency - 10);
      setTransparency(newTransparency);
    },
    [transparency, setTransparency]
  );

  // 이동 벡터 계산 함수 (사선 이동 및 충돌 키 처리)
  const calculateMovementVector = useCallback((keyStates) => {
    let deltaX = 0;
    let deltaY = 0;

    // X축 이동 계산 (왼쪽과 오른쪽이 동시에 눌리면 상쇄)
    if (keyStates.h || keyStates.arrowleft) deltaX -= 1;
    if (keyStates.l || keyStates.arrowright) deltaX += 1;

    // Y축 이동 계산 (위와 아래가 동시에 눌리면 상쇄)
    if (keyStates.k || keyStates.arrowup) deltaY -= 1;
    if (keyStates.j || keyStates.arrowdown) deltaY += 1;

    return { deltaX, deltaY };
  }, []);

  // 키보드 화살표 키로 내 캠 상하좌우 이동 (사선 이동 지원 + 경계 체크)
  const moveCamera = useCallback(
    (deltaX = 0, deltaY = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const currentX = myStyle.x;
      const currentY = myStyle.y;
      const moveAmount = 10;
      const scale = myStyle.scale || 1.0;
      // const camWidth = 161 * scale;
      // const camHeight = 121 * scale;
      const { width: camWidth, height: camHeight } = getCamSize(videoRef.current, scale);
      // 새 위치 계산
      let newX = currentX + deltaX * moveAmount;
      let newY = currentY + deltaY * moveAmount;

      // 캔버스 경계 내로 제한
      newX = Math.max(0, Math.min(newX, canvas.width - camWidth));
      newY = Math.max(0, Math.min(newY, canvas.height - camHeight));

      updateMyPosition({ x: newX, y: newY });
    },
    [myStyle, updateMyPosition]
  );

  // 마우스 이벤트 핸들러들
  const handleMouseDown = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      const { x: myX, y: myY, scale } = myStyle;
      const { width, height } = getCamSize(videoRef.current, scale); 
      // const width = 161 * scale;
      // const height = 121 * scale;

      // 캠 영역 내부인지 체크
      const isInCam =
        canvasX >= myX &&
        canvasX <= myX + width &&
        canvasY >= myY &&
        canvasY <= myY + height;

      if (isInCam) {
        // 핸들 영역 체크 (우선순위)
        if (
          isInHandleArea(
            canvasX,
            canvasY,
            myX,
            myY,
            width,
            height,
            myStyle.rotation || 0
          )
        ) {
          // 리사이즈/회전 모드
          const centerX = myX + width / 2;
          const centerY = myY + height / 2;
          const initialDistance = Math.sqrt(
            (canvasX - centerX) ** 2 + (canvasY - centerY) ** 2
          );

          dragStateRef.current = {
            ...dragStateRef.current,
            isDragging: true,
            mode: 'RESIZE_ROTATE',
            startMouseX: canvasX,
            startMouseY: canvasY,
            startRotation: myStyle.rotation || 0,
            startScale: scale,
            centerX: centerX,
            centerY: centerY,
            initialDistance: initialDistance,
          };

          canvas.style.cursor = 'nw-resize';
        } else {
          // 일반 이동 모드
          dragStateRef.current = {
            ...dragStateRef.current,
            isDragging: true,
            mode: 'MOVE',
            dragOffsetX: canvasX - myX,
            dragOffsetY: canvasY - myY,
          };

          canvas.style.cursor = 'grabbing';
        }
      }
    },
    [myStyle, isCountingDown, isInHandleArea]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      // 드래그 중이 아닐 때 호버 커서 설정
      if (!dragStateRef.current.isDragging && !isCountingDown) {
        const { x: myX, y: myY, scale } = myStyle;
        // const width = 161 * scale;
        // const height = 121 * scale;
        const { width, height } = getCamSize(videoRef.current, scale);
        const isInCam =
          canvasX >= myX &&
          canvasX <= myX + width &&
          canvasY >= myY &&
          canvasY <= myY + height;

        if (isInCam) {
          if (
            isInHandleArea(
              canvasX,
              canvasY,
              myX,
              myY,
              width,
              height,
              myStyle.rotation || 0
            )
          ) {
            canvas.style.cursor = 'nw-resize'; // 핸들 영역
          } else {
            canvas.style.cursor = 'grab'; // 일반 캠 영역
          }
        } else {
          canvas.style.cursor = 'default'; // 캠 밖
        }
        return;
      }

      if (!dragStateRef.current.isDragging || isCountingDown) return;

      const dragState = dragStateRef.current;

      if (dragState.mode === 'MOVE') {
        // 일반 이동 모드
        const newX = canvasX - dragState.dragOffsetX;
        const newY = canvasY - dragState.dragOffsetY;

        const { scale } = myStyle;
        const { width, height } = getCamSize(videoRef.current, scale); 
        // const width = 161 * scale;
        // const height = 121 * scale;

        const boundedX = Math.max(0, Math.min(newX, canvas.width - width));
        const boundedY = Math.max(0, Math.min(newY, canvas.height - height));

        updateMyPosition({
          ...myStyle,
          x: boundedX,
          y: boundedY,
        });
      } else if (dragState.mode === 'RESIZE_ROTATE') {
        // 리사이즈/회전 모드
        const { centerX, centerY, initialDistance, startRotation, startScale } =
          dragState;

        // 현재 거리와 각도 계산
        const currentDistance = Math.sqrt(
          (canvasX - centerX) ** 2 + (canvasY - centerY) ** 2
        );
        const currentAngle = Math.atan2(canvasY - centerY, canvasX - centerX);
        const startAngle = Math.atan2(
          dragState.startMouseY - centerY,
          dragState.startMouseX - centerX
        );

        // 회전 계산
        const rotationDelta = (currentAngle - startAngle) * (180 / Math.PI);
        const rawRotation = (startRotation + rotationDelta + 360) % 360;
        const snappedRotation = snapRotationAngle(rawRotation);

        // 디버깅 로그
        logRotationChange(myStyle.rotation || 0, snappedRotation, 'DRAG');

        if (e.shiftKey) {
          // Shift 모드: 리사이징 고정, 회전만
          canvas.style.cursor = 'alias';
          updateMyRotation(snappedRotation);
        } else {
          // 일반 모드: 리사이징만 (회전 고정)
          // 우하단 핸들 기준 리사이징: 좌상단 고정, 우하단이 마우스 따라감
          const fixedTopLeftX = myStyle.x;
          const fixedTopLeftY = myStyle.y;

          // 마우스 위치에서 좌상단까지의 거리로 새로운 크기 계산
          const newWidth = Math.max(20, canvasX - fixedTopLeftX);
          const newHeight = Math.max(20, canvasY - fixedTopLeftY); 

          // 비율 유지 (16:12 = 4:3) - 기본 크기(scale=1.0) 사용
          const { width: baseWidth, height: baseHeight } = getCamSize(videoRef.current, 1.0); 
          const aspectRatio = baseWidth / baseHeight;
          
          let finalWidth, finalHeight;

          if (newWidth / newHeight > aspectRatio) {
            // 너비가 비율보다 클 때: 높이 기준으로 맞춤
            finalHeight = newHeight;
            finalWidth = finalHeight * aspectRatio;
          } else {
            // 높이가 비율보다 클 때: 너비 기준으로 맞춤
            finalWidth = newWidth;
            finalHeight = finalWidth / aspectRatio;
          }

          // 스케일 계산 - 기본 크기 대비 최종 크기의 비율
          const newScale = Math.max(0.5, Math.min(2.0, finalWidth / baseWidth));

          canvas.style.cursor = 'nw-resize';

          // 리사이징만 업데이트 (좌상단 위치는 고정, 회전은 기존 값 유지)
          updateMyState({
            x: fixedTopLeftX,
            y: fixedTopLeftY,
            scale: newScale,
            // rotation은 업데이트하지 않음 (기존 값 유지)
          });
        }
      }
    },
    [
      myStyle,
      updateMyPosition,
      updateMyState,
      updateMyRotation,
      isCountingDown,
      isInHandleArea,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (dragStateRef.current.isDragging) {
      // 드래그 상태 초기화
      dragStateRef.current = {
        ...dragStateRef.current,
        isDragging: false,
        mode: null,
      };

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = isCountingDown ? 'default' : 'grab';
      }
    }
  }, [isCountingDown]);

  // 진정한 멀티태스킹 키보드 핸들러 (모든 작업 동시 지원)
  useEffect(() => {
    // 키 상태를 객체로 관리해서 실시간 업데이트 보장
    const keyStatesRef = {
      current: {
        q: false,
        w: false,
        e: false,
        r: false,
        d: false,
        f: false,
        j: false,
        k: false,
        h: false,
        l: false,
        arrowleft: false,
        arrowright: false,
        arrowup: false,
        arrowdown: false,
      },
    };

    // 모든 작업에 대한 독립적인 인터벌들
    const intervals = {
      movement: null,
      rotationClockwise: null,
      rotationCounterClockwise: null,
      scaleUp: null,
      scaleDown: null,
      transparencyUp: null,
      transparencyDown: null,
    };

    // 연속 이동 함수 (사선 이동 지원)
    const performMovement = () => {
      const keyStates = keyStatesRef.current;
      const { deltaX, deltaY } = calculateMovementVector(keyStates);
      if (deltaX !== 0 || deltaY !== 0) {
        moveCamera(deltaX, deltaY);
      }
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const keyStates = keyStatesRef.current;

      // 키 반복 방지
      if (keyStates[key]) return;

      // 키 상태 업데이트
      keyStates[key] = true;

      // 각 키별 즉시 실행 및 인터벌 시작
      switch (key) {
        case 'q': // 축소
          scaleCamera(false);
          if (!intervals.scaleDown) {
            intervals.scaleDown = setInterval(() => {
              if (keyStatesRef.current.q) scaleCamera(false);
            }, 100);
          }
          break;

        case 'w': // 확대
          scaleCamera(true);
          if (!intervals.scaleUp) {
            intervals.scaleUp = setInterval(() => {
              if (keyStatesRef.current.w) scaleCamera(true);
            }, 100);
          }
          break;

        case 'e': // 반시계방향 회전
          rotateCameraCounterClockwise();
          if (!intervals.rotationCounterClockwise) {
            intervals.rotationCounterClockwise = setInterval(() => {
              if (keyStatesRef.current.e) rotateCameraCounterClockwise();
            }, 150);
          }
          break;

        case 'r': // 시계방향 회전
          rotateCamera();
          if (!intervals.rotationClockwise) {
            intervals.rotationClockwise = setInterval(() => {
              if (keyStatesRef.current.r) rotateCamera();
            }, 150);
          }
          break;

        case 'd': // 투명도 감소
          changeTransparency(false);
          if (!intervals.transparencyDown) {
            intervals.transparencyDown = setInterval(() => {
              if (keyStatesRef.current.d) changeTransparency(false);
            }, 100);
          }
          break;

        case 'f': // 투명도 증가
          changeTransparency(true);
          if (!intervals.transparencyUp) {
            intervals.transparencyUp = setInterval(() => {
              if (keyStatesRef.current.f) changeTransparency(true);
            }, 100);
          }
          break;

        // 이동 키들
        case 'h':
        case 'j':
        case 'k':
        case 'l':
        case 'arrowleft':
        case 'arrowright':
        case 'arrowup':
        case 'arrowdown':
          // 즉시 이동 (사선 포함)
          performMovement();
          // 연속 이동 인터벌 시작 (아직 없다면)
          if (!intervals.movement) {
            intervals.movement = setInterval(performMovement, 16); // 60fps
          }
          break;

        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      const keyStates = keyStatesRef.current;

      // 키 상태 업데이트
      keyStates[key] = false;

      // 각 인터벌 정리
      switch (key) {
        case 'r':
          if (intervals.rotationClockwise) {
            clearInterval(intervals.rotationClockwise);
            intervals.rotationClockwise = null;
          }
          break;

        case 'e':
          if (intervals.rotationCounterClockwise) {
            clearInterval(intervals.rotationCounterClockwise);
            intervals.rotationCounterClockwise = null;
          }
          break;

        case 'q':
          if (intervals.scaleDown) {
            clearInterval(intervals.scaleDown);
            intervals.scaleDown = null;
          }
          break;

        case 'w':
          if (intervals.scaleUp) {
            clearInterval(intervals.scaleUp);
            intervals.scaleUp = null;
          }
          break;

        case 'd':
          if (intervals.transparencyDown) {
            clearInterval(intervals.transparencyDown);
            intervals.transparencyDown = null;
          }
          break;

        case 'f':
          if (intervals.transparencyUp) {
            clearInterval(intervals.transparencyUp);
            intervals.transparencyUp = null;
          }
          break;

        // 이동 키들 - 다른 이동 키가 남아있는지 확인
        case 'h':
        case 'j':
        case 'k':
        case 'l':
        case 'arrowleft':
        case 'arrowright':
        case 'arrowup':
        case 'arrowdown':
          // 모든 이동 키 확인
          const stillMoving =
            keyStates.h ||
            keyStates.j ||
            keyStates.k ||
            keyStates.l ||
            keyStates.arrowleft ||
            keyStates.arrowright ||
            keyStates.arrowup ||
            keyStates.arrowdown;

          if (!stillMoving && intervals.movement) {
            clearInterval(intervals.movement);
            intervals.movement = null;
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      // 모든 인터벌 정리
      Object.values(intervals).forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, [
    rotateCamera,
    rotateCameraCounterClockwise,
    scaleCamera,
    moveCamera,
    changeTransparency,
    calculateMovementVector,
  ]);

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = isCountingDown ? 'default' : 'grab';

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, isCountingDown]);

  // 🎯 터치 이벤트 리스너 등록
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 터치 이벤트는 passive: false로 preventDefault 허용
    const touchOptions = { passive: false };

    canvas.addEventListener('touchstart', handleTouchStart, touchOptions);
    canvas.addEventListener('touchmove', handleTouchMove, touchOptions);
    canvas.addEventListener('touchend', handleTouchEnd, touchOptions);
    canvas.addEventListener('touchcancel', handleTouchCancel, touchOptions);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  // WebRTC 이벤트 리스너
  useEffect(() => {
    const handleWebRTCEvents = (event) => {
      const { type, data } = event.detail;

      switch (type) {
        case 'sdp-offer':
          handleOffer(data);
          break;
        case 'sdp-answer':
          handleAnswer(data);
          break;
        case 'ice-candidate':
          handleIceCandidate(data);
          break;
        case 'user-joined':
          // /* console.log('👥 사용자 참가:', data); */

          const newParticipants = Object.entries(data.participants).map(
            ([id, nickname]) => ({
              clientId: id,
              nickname,
              x: 100,
              y: 100,
              scale: 1.0,
              opacity: 1.0,
              isHost: false,
            })
          );

          if (data.newComer.clientId !== clientId) {
            // /* console.log(`🔗 새 참가자와 연결 시작: ${data.newComer.clientId}`); */

            if (peerConnectionsRef.current[data.newComer.clientId]) {
              peerConnectionsRef.current[data.newComer.clientId].close();
              delete peerConnectionsRef.current[data.newComer.clientId];
            }

            setTimeout(() => {
              connectToNewParticipant(data.newComer.clientId);
            }, 1000);
          }

          newParticipants.forEach((participant) => {
            if (
              participant.clientId !== clientId &&
              participant.clientId !== data.newComer.clientId
            ) {
              const existingConnection =
                peerConnectionsRef.current[participant.clientId];
              const needsReconnection =
                !existingConnection ||
                existingConnection.connectionState === 'failed' ||
                existingConnection.connectionState === 'disconnected' ||
                existingConnection.iceConnectionState === 'failed' ||
                existingConnection.iceConnectionState === 'disconnected';

              if (needsReconnection) {
                const connectionState =
                  existingConnection?.connectionState || 'none';
                const iceState =
                  existingConnection?.iceConnectionState || 'none';

                // console.log(
                //   `🔄 기존 참가와 재연결 필요: ${participant.clientId}`
                // );
                // console.log(
                //   `  - 연결 상태: ${connectionState}, ICE 상태: ${iceState}`
                // );

                if (existingConnection) {
                  // /* console.log(`🧹 실패한 연결 정리: ${participant.clientId}`); */
                  existingConnection.close();
                  delete peerConnectionsRef.current[participant.clientId];

                  if (remoteVideoElements[participant.clientId]) {
                    remoteVideoElements[participant.clientId].remove();
                    delete remoteVideoElements[participant.clientId];
                  }
                }

                setTimeout(() => {
                  if (typeof createPeerConnection === 'function') {
                    createPeerConnection(participant.clientId, false);
                  } else {
                    connectToNewParticipant(participant.clientId);
                  }
                }, 1500);
              } else {
                const connectionState =
                  existingConnection?.connectionState || 'unknown';
                const iceState =
                  existingConnection?.iceConnectionState || 'unknown';
              }
            }
          });
          break;

        case 'canvas-sync':
          if (data.participants) {
            data.participants.forEach((participant) => {
              if (participant.clientId !== clientId) {
                const existingConnection =
                  peerConnectionsRef.current[participant.clientId];
                const needsReconnection =
                  !existingConnection ||
                  existingConnection.connectionState === 'failed' ||
                  existingConnection.connectionState === 'disconnected';

                if (
                  needsReconnection &&
                  !remoteVideoElements[participant.clientId]
                ) {
                  setTimeout(() => {
                    connectToNewParticipant(participant.clientId);
                  }, 2000);
                }
              }
            });
          }
          break;

        case 'user-left':
          if (data.lastLeaver) {
            if (peerConnectionsRef.current[data.lastLeaver.clientId]) {
              peerConnectionsRef.current[data.lastLeaver.clientId].close();
              delete peerConnectionsRef.current[data.lastLeaver.clientId];
            }

            disconnectParticipant(data.lastLeaver.clientId);

            cleanupParticipantMediaPipe(data.lastLeaver.clientId);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('webrtc-event', handleWebRTCEvents);
    return () => window.removeEventListener('webrtc-event', handleWebRTCEvents);
  }, [
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    connectToNewParticipant,
    disconnectParticipant,
    clientId,
    remoteVideoElements,
    createPeerConnection,
  ]);

  // 캔버스 ID 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.id = 'recording-canvas';
    }
  }, []);

  // 설정 변경 시 자동 WebSocket 전송
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (clientId && roomCode && participantsState[clientId]) {
      try {
        const currentState = participantsState[clientId];
        const updatedState = {
          ...currentState,
          mode: cameraMode,
          filter: selectedFilter?.name || null,
          opacity: transparency / 100,
          isMicOn: isMicOn,
          overlay: selectedOverlay || null,
        };

        updateMyPosition(updatedState);
      } catch (error) {}
    }
  }, [cameraMode, selectedFilter, selectedOverlay, transparency, isMicOn]);

  // 로컬 비디오 설정
  useEffect(() => {
    if (videoRef.current) {
      if (localStream) {
        videoRef.current.srcObject = localStream;
      }
    }
  }, [localStream]);

  // 캔버스 렌더링 (30fps 제한)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
    if (!canvas || !ctx || !video) {
      return;
    }

    let animationId;
    let frameCount = 0;
    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS; // 33.33ms

    const render = (currentTime) => {
      //  30fps 제한
      if (currentTime - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(render);
        return;
      }

      lastFrameTime = currentTime;
      frameCount++;

      if (frameCount % 30 === 0) {
        // 30fps 기준으로 1초마다
        const status = getSchedulerStatus();
        // /* console.log(`📊 스케줄러 상태 (${frameCount}프레임, 30fps):`, status); */
      }

      // 캔버스 배경 처리
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 배경 이미지 렌더링
      if (backgroundImageRef.current && backgroundImageLoaded) {
        try {
          ctx.drawImage(
            backgroundImageRef.current,
            0,
            0,
            canvas.width,
            canvas.height
          );
        } catch (drawError) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 내 비디오 렌더링 - 카메라가 켜져 있을 때만
      if (localStream && video.readyState >= 2) {
        const { x, y, scale, opacity } = myStyle;
        const { width, height } = getCamSize(video, scale); 
        // const width = 161 * scale;
        // const height = 121 * scale;

        renderStreamWithCachedMask(ctx, video, x, y, width, height, {
          participantId: clientId,
          mode: cameraMode,
          filter: myStyle.filter || selectedFilter?.name,
          opacity: opacity,
          flipHorizontal: true,
          rotation: myStyle.rotation || 0, // 회전 각도 전달
          overlay: selectedOverlay || null, //overlay 전달
        });
      }

      // 다른 참가자들 비디오 렌더링
      for (const [participantId, style] of Object.entries(participantsState)) {
        if (participantId !== clientId) {
          const { x, y, scale, opacity, filter, mode, rotation, overlay } =
            style;
          const remoteVideo = remoteVideoElements[participantId];
          const { width, height } = getCamSize(remoteVideo, scale); 
          // const width = 161* scale;
          // const height = 121 * scale;

          if (remoteVideoElements[participantId]) {
            const remoteVideo = remoteVideoElements[participantId];

            if (remoteVideo.readyState >= 2) {
              renderStreamWithCachedMask(
                ctx,
                remoteVideo,
                x,
                y,
                width,
                height,
                {
                  participantId: participantId,
                  mode: mode || 1,
                  filter: filter,
                  opacity: opacity || 1,
                  flipHorizontal: true,
                  rotation: rotation || 0, // 다른 참가자 회전 각도 전달
                  overlay: overlay || null,
                }
              );
            } else {
              drawParticipantPlaceholder(
                ctx,
                x,
                y,
                width,
                height,
                style.nickname || participantId
              );
            }
          } else {
            drawParticipantPlaceholder(
              ctx,
              x,
              y,
              width,
              height,
              style.nickname || participantId
            );
          }
        }
      }

      // 카운트다운 오버레이 렌더링 (모든 요소 위에)
      drawCountdownOverlay(ctx, canvas.width, canvas.height);

      animationId = requestAnimationFrame(render);
    };

    // 첫 프레임 시작
    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    myStyle,
    clientId,
    participantsState,
    remoteVideoElements,
    selectedFilter,
    transparency,
    cameraMode,
    aiLoaded,
    drawParticipantPlaceholder,
    backgroundImageLoaded,
    drawCountdownOverlay, // 카운트다운 오버레이 의존성 추가
  ]);

  return (
    // <div className='w-full h-full bg-white border-4 border-blue-500 rounded-xl relative'>
    <div className='w-full h-full border-4 relative'>
      <div
        className='absolute inset-0 rounded-lg'
        style={{
          background:
            'repeating-conic-gradient(#e5e5e5 0% 25%, transparent 0% 50%) 50% / 20px 20px',
          zIndex: 0,
        }}
      />

      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className='w-full h-full relative z-10'
        style={{ background: 'transparent' }}
      />

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* 카운트다운 상태 표시 (UI 피드백용) */}
      {isCountingDown && (
        <div className='absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg z-20'>
          <span className='text-sm font-bold'>{countdown}초 후 촬영...</span>
        </div>
      )}

      {/* 녹화 상태 표시 */}
      {isRecording && (
        <div className='absolute top-4 right-4 bg-red-600 bg-opacity-90 text-white px-3 py-2 rounded-lg z-20'>
          <span className='text-sm font-bold flex items-center gap-2'>
            <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>
            REC
          </span>
        </div>
      )}
    </div>
  );
});

RecordingCanvas.displayName = 'RecordingCanvas';

export default RecordingCanvas;
