// frontend/src/hooks/useCamera.js
/* eslint-disable */
import { useEffect, useRef, useState, useCallback } from 'react';
import useCameraStore from '../stores/cameraStore';
import { useDeviceSettings } from './useDeviceSettings';
import useMediaPermissions from './useMediaPermissions';

/**
 * useCamera - 카메라 및 마이크 스트림 생성 전용 훅 + 하드토글 기능 포함
 * 카메라 입력 장치 변경 기능 제거, 마이크 입력 장치 변경은 유지
 * @param {Object} options - 설정 객체
 * @param {boolean} options.autoStart - 마운트 시 자동 시작 여부
 * @param {boolean} options.defaultMicOn - 초기 마이크 상태
 * @param {boolean} options.showDeviceSettings - 디바이스 설정 표시 (사용 안함)
 */
export default function useCamera({
  autoStart = false,
  defaultMicOn = false,
  showDeviceSettings = false, // 사용하지 않음
} = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [autoStartCompleted, setAutoStartCompleted] = useState(false);
  const initializingRef = useRef(false);
  const permissions = useMediaPermissions();

  const {
    setLocalStream,
    setVideoEnabled,
    setAudioEnabled,
    isVideoEnabled,
    isAudioEnabled,
  } = useCameraStore();

  // 디바이스 설정 훅 - 마이크 입력과 오디오 출력 지원
  const {
    devices,
    selectedDevices,
    isLoading: devicesLoading,
    error: deviceError,
    support,
    refreshDevices,
    changeDevice,
    registerAudioElement,
    selectAudioDevice,
    selectOutputDevice,
    hasAudioDevices,
    getCurrentDeviceInfo,
  } = useDeviceSettings({
    autoSave: false,
    detectChanges: false,
  });

  /**
   * 🔧 개선된 기본 카메라 시작 함수 - 디바이스 ID 없이 기본 설정으로 시작
   */
  const startCamera = useCallback(
    async (deviceOptions = {}) => {
      if (isLoading || initializingRef.current) {
        return;
      }

      try {
        initializingRef.current = true;
        setIsLoading(true);
        setStreamError(null);

        const { video = true, audio = true } = deviceOptions;

        // 기본 getUserMedia 사용 (디바이스 ID 지정 없음)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audio
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : false,
        });

        // 마이크 초기 설정
        if (audio && stream.getAudioTracks().length > 0) {
          stream.getAudioTracks().forEach((track) => {
            track.enabled = defaultMicOn;
          });
        }

        setCurrentStream(stream);
        streamRef.current = stream;
        setLocalStream(stream);
        setVideoEnabled(video && stream.getVideoTracks().length > 0);
        setAudioEnabled(
          defaultMicOn && audio && stream.getAudioTracks().length > 0
        );
      } catch (err) {
        // console.error('❌ 기본 카메라 시작 실패:', err);
        setStreamError(err.message);

        if (err.name === 'NotAllowedError') {
          // alert('카메라 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
          // console.log(
          //   '카메라 권한이 필요합니다. 브라우저 설정을 확인해주세요.'
          // );
        } else if (err.name === 'NotFoundError') {
          // console.log(
          //   '카메라나 마이크를 찾을 수 없습니다. 디바이스 연결을 확인해주세요.'
          // );
        } else {
          // console.log(`카메라 접근 중 오류가 발생했습니다: ${err.message}`);
        }

        throw err;
      } finally {
        setIsLoading(false);
        initializingRef.current = false;
      }
    },
    [isLoading, defaultMicOn, setLocalStream, setVideoEnabled, setAudioEnabled]
  );

  /**
   * 특정 마이크 디바이스로 카메라 시작 (마이크 디바이스 변경용)
   */
  const startCameraWithAudioDevice = useCallback(
    async (deviceOptions = {}) => {
      if (isLoading || initializingRef.current) return;

      try {
        initializingRef.current = true;
        setIsLoading(true);
        setStreamError(null);

        const {
          audioDeviceId = selectedDevices.audioInput,
          video = true,
          audio = true,
        } = deviceOptions;

        const constraints = {};

        // 비디오는 항상 기본 디바이스
        if (video) {
          constraints.video = {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
          };
        }

        // 오디오는 특정 디바이스 또는 기본 디바이스
        if (audio) {
          constraints.audio = audioDeviceId
            ? {
                deviceId: { exact: audioDeviceId },
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000,
                channelCount: 1,
                latency: 0.01,
                volume: 0.8,
                // 고급 노이즈 처리
                googEchoCancellation: true,
                googNoiseSuppression: true,
                googAutoGainControl: true,
                googHighpassFilter: true,
                googTypingNoiseDetection: true,
                googNoiseReduction: true,
              }
            : {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000,
                channelCount: 1,
                latency: 0.01,
                volume: 0.8,
                // 고급 노이즈 처리
                googEchoCancellation: true,
                googNoiseSuppression: true,
                googAutoGainControl: true,
                googHighpassFilter: true,
                googTypingNoiseDetection: true,
                googNoiseReduction: true,
              };
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // 마이크 초기 설정
        if (audio && stream.getAudioTracks().length > 0) {
          stream.getAudioTracks().forEach((track) => {
            track.enabled = defaultMicOn;
          });
        }

        setCurrentStream(stream);
        streamRef.current = stream;
        setLocalStream(stream);
        setVideoEnabled(video && stream.getVideoTracks().length > 0);
        setAudioEnabled(
          defaultMicOn && audio && stream.getAudioTracks().length > 0
        );
      } catch (err) {
        console.error('❌ 마이크 디바이스 카메라 시작 실패:', err);
        setStreamError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
        initializingRef.current = false;
      }
    },
    [
      isLoading,
      selectedDevices,
      defaultMicOn,
      setLocalStream,
      setVideoEnabled,
      setAudioEnabled,
    ]
  );

  const stopCamera = useCallback(() => {
    const streamToStop = streamRef.current;
    if (streamToStop) {
      streamToStop.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCurrentStream(null);
    setLocalStream(null);
    setVideoEnabled(false);
    setAudioEnabled(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [setLocalStream, setVideoEnabled, setAudioEnabled]);

  const stopMic = useCallback(() => {
    const audioTrack = streamRef.current
      ?.getAudioTracks()
      .find((t) => t.kind === 'audio');

    if (audioTrack) {
      streamRef.current?.removeTrack(audioTrack);
      audioTrack.stop();
      setAudioEnabled(false);
    }
  }, [setAudioEnabled]);

  /**
   * 마이크 시작 (특정 디바이스 지원)
   */
  const startMic = useCallback(async () => {
    try {
      let audioDeviceId = selectedDevices.audioInput;

      if (!audioDeviceId && hasAudioDevices && devices.audioInputs.length > 0) {
        audioDeviceId = devices.audioInputs[0].deviceId;
      }

      const audioConstraints = {
        audio: audioDeviceId
          ? {
              deviceId: { exact: audioDeviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 1,
              latency: 0.01,
              volume: 0.8,
              // 고급 노이즈 처리
              googEchoCancellation: true,
              googNoiseSuppression: true,
              googAutoGainControl: true,
              googHighpassFilter: true,
              googTypingNoiseDetection: true,
              googNoiseReduction: true,
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 1,
              latency: 0.01,
              volume: 0.8,
              // 고급 노이즈 처리
              googEchoCancellation: true,
              googNoiseSuppression: true,
              googAutoGainControl: true,
              googHighpassFilter: true,
              googTypingNoiseDetection: true,
              googNoiseReduction: true,
            },
      };

      const newAudioStream =
        await navigator.mediaDevices.getUserMedia(audioConstraints);
      const newAudioTrack = newAudioStream.getAudioTracks()[0];

      if (newAudioTrack && streamRef.current) {
        streamRef.current.addTrack(newAudioTrack);
        setAudioEnabled(true);
      }
    } catch (err) {
      console.error('❌ 마이크 시작 실패:', err);
      setStreamError('마이크를 시작할 수 없습니다.');
    }
  }, [selectedDevices.audioInput, setAudioEnabled, hasAudioDevices, devices]);

  const hardToggleCamera = useCallback(async () => {
    if (currentStream) {
      stopCamera();
    } else {
      await startCamera();
    }
  }, [currentStream, stopCamera, startCamera]);

  const hardToggleMic = useCallback(async () => {
    const audioTrack = streamRef.current
      ?.getAudioTracks()
      .find((t) => t.kind === 'audio');

    if (audioTrack && audioTrack.enabled) {
      stopMic();
    } else if (audioTrack && !audioTrack.enabled) {
      audioTrack.enabled = true;
      setAudioEnabled(true);
    } else {
      await startMic();
    }
  }, [stopMic, setAudioEnabled, startMic]);

  /**
   * 🔧 마이크 디바이스 변경 핸들러
   */
  const handleAudioDeviceChange = useCallback(
    async (deviceId) => {
      try {
        if (selectedDevices.audioInput === deviceId) {
          return; // 동일한 디바이스면 변경하지 않음
        }

        await changeDevice('audioInput', deviceId);

        // 현재 스트림이 있고 오디오가 활성화된 경우 재시작
        if (currentStream && isAudioEnabled) {
          const wasVideoEnabled = isVideoEnabled;

          // 잠시 중지
          stopCamera();

          // 새 디바이스로 재시작
          setTimeout(async () => {
            await startCameraWithAudioDevice({
              audioDeviceId: deviceId,
              video: wasVideoEnabled,
              audio: true,
            });
          }, 300);
        }
      } catch (error) {
        console.error('❌ 마이크 디바이스 변경 실패:', error);
        setStreamError('마이크 디바이스 변경 중 오류가 발생했습니다.');
      }
    },
    [
      changeDevice,
      selectedDevices.audioInput,
      currentStream,
      isAudioEnabled,
      isVideoEnabled,
      stopCamera,
      startCameraWithAudioDevice,
    ]
  );

  /**
   * 오디오 출력 엘리먼트 등록 (비디오 요소용)
   */
  const attachAudioOutput = useCallback(
    async (videoElement) => {
      if (!videoElement) return;

      try {
        registerAudioElement(videoElement);

        const outputDeviceId = selectedDevices.audioOutput;

        if (outputDeviceId && typeof videoElement.setSinkId === 'function') {
          await videoElement.setSinkId(outputDeviceId);
        }
      } catch (err) {
        console.error('🔇 오디오 출력 장치 변경 실패:', err);
      }
    },
    [registerAudioElement, selectedDevices.audioOutput]
  );

  // 자동 시작 로직
  useEffect(() => {
    if (
      autoStart &&
      !autoStartCompleted &&
      !currentStream &&
      !isLoading &&
      !initializingRef.current
    ) {
      if (permissions.isDenied) return;
      setAutoStartCompleted(true);

      startCamera().catch((error) => {
        console.warn('❌ 자동 시작 실패:', error.message);
        setAutoStartCompleted(false);
      });
    }
  }, [
    autoStart,
    autoStartCompleted,
    currentStream,
    startCamera,
    isLoading,
    permissions.isDenied,
  ]);

  // 비디오 요소에 스트림 연결
  useEffect(() => {
    if (!currentStream || !videoRef.current) return;

    const video = videoRef.current;

    let timeoutId;

    const tryAttach = () => {
      // if (videoRef.current && videoRef.current !== video.srcObject) {
      if (video.srcObject !== currentStream) {
        videoRef.current.srcObject = currentStream;
        attachAudioOutput(videoRef.current);
      } else {
        requestAnimationFrame(tryAttach);
      }
    };

    tryAttach();
    timeoutId = setTimeout(tryAttach, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStream, attachAudioOutput]);

  // ✅ 모바일에서 앱을 내리거나 잠금/탭 전환 시 스트림을 완전히 종료
  useEffect(() => {
    const hardStop = () => {
      const s = streamRef.current;
      if (!s) return;

      try {
        s.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
      } finally {
        streamRef.current = null;
        setCurrentStream(null);
        setLocalStream(null);
        setVideoEnabled(false);
        setAudioEnabled(false);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        // console.log('🛑 백그라운드/잠금 감지 → 스트림 완전 종료');
      }
    };

    // 문서가 숨겨질 때(iOS/Android 잠금, 앱 전환 포함) 바로 종료
    const onVisibility = () => {
      if (document.hidden) hardStop();
    };

    // 페이지가 숨김 상태로 전환될 때(bfcache 진입 등)도 종료
    const onPageHide = () => {
      hardStop();
    };

    // 탭/창 닫힘 직전에 종료
    const onBeforeUnload = () => {
      hardStop();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [setLocalStream, setVideoEnabled, setAudioEnabled]);

  // useEffect(() => {
  //   if (!currentStream || !videoRef.current) return;
  //   const video = videoRef.current;

  //   const attach = async () => {
  //     // ✅ 올바른 비교
  //     if (video.srcObject !== currentStream) {
  //       video.srcObject = currentStream;
  //     }
  //     // ✅ 안드/모바일에서 재생 보장
  //     try {
  //       await video.play();
  //     } catch (e) {
  //       console.warn(
  //         'video.play() failed (will retry on user gesture):',
  //         e?.message
  //       );
  //     }
  //     // (필요시) 오디오 출력 연결 유지
  //     attachAudioOutput?.(video);
  //   };

  //   attach();
  // }, [currentStream, attachAudioOutput]);

  // 에러 상태 통합
  const combinedError = streamError || deviceError;

  return {
    // 기본 기능
    videoRef,
    currentStream,
    isLoading: isLoading || devicesLoading,
    error: combinedError,

    // 카메라 제어
    startCamera,
    stopCamera,
    startMic,
    stopMic,
    hardToggleCamera,
    hardToggleMic,

    // 마이크 입력 및 오디오 출력 디바이스 관리
    devices: {
      audioInputs: devices.audioInputs, // 마이크 입력
      audioOutputs: devices.audioOutputs, // 오디오 출력
    },
    selectedDevices: {
      audioInput: selectedDevices.audioInput, // 마이크 입력
      audioOutput: selectedDevices.audioOutput, // 오디오 출력
    },
    selectAudioDevice,
    selectOutputDevice,
    handleAudioDeviceChange,
    getCurrentDeviceInfo,
    attachAudioOutput,

    permissions: {
      loading: permissions.loading,
      state: permissions.state,
      isDenied: permissions.isDenied,
      isPrompt: permissions.isPrompt,
      isGranted: permissions.isGranted,
      requestBoth: permissions.requestBoth,
      refresh: permissions.refresh,
      platformHelp: permissions.platformHelp,
    },

    // 상태
    hasAudioDevices,
    support,

    // 고급 기능
    startCameraWithAudioDevice,

    // 상태 확인
    isReady: hasAudioDevices && !isLoading,
    canStart: hasAudioDevices && !isLoading,
    isActive: !!currentStream,
    autoStartCompleted,
  };
}
