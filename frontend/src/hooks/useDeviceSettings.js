/* eslint-disable */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAvailableDevices,
  setAudioOutputDevice,
  addDeviceChangeListener,
  saveDeviceSettings,
  loadDeviceSettings,
  checkMediaSupport,
  getDefaultDeviceId,
} from '../utils/deviceUtils';

/**
 * 디바이스 설정 관리 커스텀 훅 (카메라/마이크 입력 디바이스 변경 기능 제거)
 * 오직 오디오 출력 디바이스 관리만 제공
 * @param {Object} options - 옵션 설정
 * @param {boolean} options.autoSave - 설정 자동 저장 여부
 * @param {boolean} options.detectChanges - 디바이스 변경 자동 감지 여부
 * @returns {Object} 디바이스 설정 관련 상태와 함수들
 */
export const useDeviceSettings = ({
  autoSave = true,
  detectChanges = true,
} = {}) => {
  // 상태 관리
  const [devices, setDevices] = useState({
    videoInputs: [], // 정보 조회용으로만 유지
    audioInputs: [], // 정보 조회용으로만 유지
    audioOutputs: [], // 실제 사용
  });

  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: '', // 마이크 입력 디바이스
    audioOutput: '', // 오디오 출력 디바이스
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [support, setSupport] = useState({});
  const [initialized, setInitialized] = useState(false);

  // 레퍼런스
  const deviceChangeListenerRef = useRef(null);
  const audioElementsRef = useRef(new Set());

  /**
   * 디바이스 목록 새로고침
   */
  const refreshDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deviceList = await getAvailableDevices();
      setDevices(deviceList);

      // 초기화 시에만 기본 디바이스 자동 선택
      if (!initialized) {
        const newSelected = { ...selectedDevices };
        let hasChanges = false;

        if (!selectedDevices.audioInput && deviceList.audioInputs.length > 0) {
          newSelected.audioInput = getDefaultDeviceId(
            deviceList.audioInputs,
            'audioinput'
          );
          hasChanges = true;
        }

        if (
          !selectedDevices.audioOutput &&
          deviceList.audioOutputs.length > 0
        ) {
          newSelected.audioOutput = getDefaultDeviceId(
            deviceList.audioOutputs,
            'audiooutput'
          );
          hasChanges = true;
        }

        if (hasChanges) {
          setSelectedDevices(newSelected);

          if (autoSave) {
            saveDeviceSettings(newSelected);
          }
        }

        setInitialized(true);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ 디바이스 목록 새로고침 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevices, autoSave, initialized]);

  /**
   * 오디오 디바이스 변경 (입력/출력 모두 지원, 비디오 입력은 제외)
   */
  const changeDevice = useCallback(
    async (deviceType, deviceId) => {
      // 비디오 입력은 허용하지 않음, 오디오 입력/출력만 허용
      if (deviceType === 'videoInput') {
        console.warn(
          '비디오 입력 디바이스 변경은 지원하지 않습니다:',
          deviceType
        );
        return;
      }

      if (!['audioInput', 'audioOutput'].includes(deviceType)) {
        console.warn('지원하지 않는 디바이스 타입:', deviceType);
        return;
      }

      if (selectedDevices[deviceType] === deviceId) {
        return;
      }

      const newSelected = {
        ...selectedDevices,
        [deviceType]: deviceId,
      };

      setSelectedDevices(newSelected);

      // 자동 저장
      if (autoSave) {
        saveDeviceSettings(newSelected);
      }

      // 오디오 출력은 즉시 적용
      if (deviceType === 'audioOutput') {
        audioElementsRef.current.forEach((element) => {
          setAudioOutputDevice(element, deviceId);
        });
      }
    },
    [selectedDevices, autoSave]
  );

  /**
   * 오디오 출력 엘리먼트 등록
   */
  const registerAudioElement = useCallback(
    (element) => {
      if (
        element &&
        element.tagName &&
        (element.tagName === 'VIDEO' || element.tagName === 'AUDIO')
      ) {
        audioElementsRef.current.add(element);

        // 현재 선택된 출력 디바이스 적용
        if (selectedDevices.audioOutput) {
          setAudioOutputDevice(element, selectedDevices.audioOutput);
        }
      }
    },
    [selectedDevices.audioOutput]
  );

  /**
   * 오디오 출력 엘리먼트 등록 해제
   */
  const unregisterAudioElement = useCallback((element) => {
    audioElementsRef.current.delete(element);
  }, []);

  /**
   * 디바이스 설정 초기화
   */
  const resetDeviceSettings = useCallback(() => {
    setSelectedDevices({
      audioInput: '',
      audioOutput: '',
    });

    if (autoSave) {
      localStorage.removeItem('clov_device_settings');
    }

    setInitialized(false);
  }, [autoSave]);

  /**
   * 디바이스 정보 가져오기
   */
  const getDeviceInfo = useCallback(
    (deviceId, deviceType) => {
      const deviceList = devices[deviceType + 's'] || [];
      return deviceList.find((device) => device.deviceId === deviceId);
    },
    [devices]
  );

  /**
   * 현재 선택된 디바이스 정보
   */
  const getCurrentDeviceInfo = useCallback(() => {
    return {
      audio: getDeviceInfo(selectedDevices.audioInput, 'audioInput'),
      output: getDeviceInfo(selectedDevices.audioOutput, 'audioOutput'),
    };
  }, [selectedDevices, getDeviceInfo]);

  // 초기화
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;

      setSupport(checkMediaSupport());

      // 저장된 설정 불러오기 (마이크 입력 + 오디오 출력)
      if (autoSave) {
        const savedSettings = loadDeviceSettings();
        if (savedSettings) {
          const validSettings = {
            audioInput: savedSettings.audioInput || '',
            audioOutput: savedSettings.audioOutput || '',
          };
          setSelectedDevices(validSettings);
        }
      }

      try {
        await refreshDevices();
      } catch (error) {
        console.error('❌ useDeviceSettings 초기화 실패:', error);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // 디바이스 변경 감지 (초기화 완료 후에만)
  useEffect(() => {
    if (detectChanges && support.deviceChange && initialized) {
      deviceChangeListenerRef.current = addDeviceChangeListener(
        (newDevices) => {
          setDevices(newDevices);
        }
      );
    }

    return () => {
      if (deviceChangeListenerRef.current) {
        deviceChangeListenerRef.current();
      }
    };
  }, [detectChanges, support.deviceChange, initialized]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (deviceChangeListenerRef.current) {
        deviceChangeListenerRef.current();
      }
    };
  }, []);

  return {
    // 상태
    devices,
    selectedDevices,
    isLoading,
    error,
    support,
    initialized,

    // 액션 (오디오 출력만)
    refreshDevices,
    changeDevice, // 오디오 출력만 지원
    registerAudioElement,
    unregisterAudioElement,
    resetDeviceSettings,

    // 유틸리티
    getDeviceInfo,
    getCurrentDeviceInfo,

    // 편의 함수들 (마이크 입력 + 오디오 출력)
    selectAudioDevice: (deviceId) => changeDevice('audioInput', deviceId),
    selectOutputDevice: (deviceId) => changeDevice('audioOutput', deviceId),

    // 상태 체크
    hasVideoDevices: devices.videoInputs.length > 0, // 정보용
    hasAudioDevices: devices.audioInputs.length > 0, // 정보용
    hasOutputDevices: devices.audioOutputs.length > 0,
  };
};

export default useDeviceSettings;
