// utils/deviceUtils.js
/* eslint-disable */

/**
 * 디바이스 관리 유틸리티 함수들
 */

/**
 * 사용 가능한 미디어 디바이스 목록 가져오기 (OBS 등 가상 카메라 제외)
 * @returns {Promise<Object>} 디바이스 목록 객체
 */
export const getAvailableDevices = async () => {
  try {
    // 권한 요청 (필수)
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const devices = await navigator.mediaDevices.enumerateDevices();

    // OBS 등 가상 카메라 필터링용 키워드
    const virtualCameraKeywords = [
      'obs virtual camera',
      'obs camera',
      'obs',
      'virtual camera',
      'manycam',
      'xsplit',
      'snap camera',
      'youCam',
      'cyberLink',
      'nvidia broadcast',
      'streamlabs',
      'bandicam',
      'logitech capture',
      'elgatovideo',
      'ndi',
      'atem',
      'blackmagic',
      'droidcam',
      'epoccam',
      'ivcam',
      'camo',
    ];

    const videoInputs = devices
      .filter((device) => device.kind === 'videoinput')
      .filter((device) => {
        const deviceName = (device.label || '').toLowerCase();

        // 가상 카메라 키워드가 포함된 디바이스 제외
        return !virtualCameraKeywords.some((keyword) =>
          deviceName.includes(keyword)
        );
      });

    return {
      videoInputs,
      audioInputs: devices.filter((device) => device.kind === 'audioinput'),
      audioOutputs: devices.filter((device) => device.kind === 'audiooutput'),
    };
  } catch (error) {
    // console.error('디바이스 목록 가져오기 실패:', error);
    // throw new Error(
    //   '디바이스에 접근할 수 없습니다. 브라우저 권한을 확인해주세요.'
    // );
    // 콘솔 노출 방지: 조용히 빈 목록 반환
    return { videoInputs: [], audioInputs: [], audioOutputs: [] };
  }
};

/**
 * 특정 디바이스로 미디어 스트림 생성
 * @param {Object} deviceIds - 선택된 디바이스 ID들
 * @param {string} deviceIds.videoInput - 비디오 입력 디바이스 ID
 * @param {string} deviceIds.audioInput - 오디오 입력 디바이스 ID
 * @returns {Promise<MediaStream>} 미디어 스트림
 */
export const createStreamWithDevices = async ({ videoInput, audioInput }) => {
  try {
    const constraints = {};

    // ✅ 수정: video와 audio 중 최소 하나는 요청되어야 함
    let hasVideo = false;
    let hasAudio = false;

    if (videoInput) {
      constraints.video = {
        deviceId: { exact: videoInput },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
      };
      hasVideo = true;
    }

    if (audioInput) {
      constraints.audio = {
        deviceId: { exact: audioInput },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };
      hasAudio = true;
    }

    // ✅ 추가: video와 audio 중 아무것도 요청하지 않으면 에러
    if (!hasVideo && !hasAudio) {
      throw new Error('video 또는 audio 중 최소 하나는 활성화되어야 합니다.');
    }

    // ✅ 개선: 명시적으로 false 설정
    if (!hasVideo) {
      constraints.video = false;
    }

    if (!hasAudio) {
      constraints.audio = false;
    }

    // console.log('🎥 기본 스트림 요청:', {
    //   hasVideo,
    //   hasAudio,
    //   constraints: {
    //     video: constraints.video ? '활성화' : '비활성화',
    //     audio: constraints.audio ? '활성화' : '비활성화',
    //   },
    // });

    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('스트림 생성 실패:', error);

    // ✅ 개선된 에러 메시지
    if (error.name === 'NotAllowedError') {
      throw new Error(
        '카메라/마이크 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.'
      );
    } else if (error.name === 'NotFoundError') {
      throw new Error(
        '요청된 카메라/마이크를 찾을 수 없습니다. 디바이스 연결을 확인해주세요.'
      );
    } else if (error.name === 'NotReadableError') {
      throw new Error('카메라/마이크가 다른 애플리케이션에서 사용 중입니다.');
    } else {
      throw new Error(
        `선택된 디바이스로 스트림을 생성할 수 없습니다: ${error.message}`
      );
    }
  }
};

/**
 * 오디오 출력 디바이스 설정 (지원하는 브라우저에서만)
 * @param {HTMLMediaElement} audioElement - 오디오/비디오 엘리먼트
 * @param {string} deviceId - 출력 디바이스 ID
 * @returns {Promise<boolean>} 설정 성공 여부
 */
export const setAudioOutputDevice = async (audioElement, deviceId) => {
  try {
    if (audioElement.setSinkId) {
      await audioElement.setSinkId(deviceId);
      // console.log('오디오 출력 디바이스 변경 성공:', deviceId);
      return true;
    } else {
      console.warn(
        '이 브라우저는 오디오 출력 디바이스 선택을 지원하지 않습니다.'
      );
      return false;
    }
  } catch (error) {
    console.error('오디오 출력 디바이스 설정 실패:', error);
    return false;
  }
};

/**
 * 디바이스 변경 감지 이벤트 리스너 추가
 * @param {Function} callback - 디바이스 변경 시 호출될 콜백
 * @returns {Function} 이벤트 리스너 제거 함수
 */
export const addDeviceChangeListener = (callback) => {
  const handleDeviceChange = async () => {
    try {
      const devices = await getAvailableDevices();
      callback(devices);
    } catch (error) {
      console.error('디바이스 변경 감지 실패:', error);
    }
  };

  navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

  // 제거 함수 반환
  return () => {
    navigator.mediaDevices.removeEventListener(
      'devicechange',
      handleDeviceChange
    );
  };
};

/**
 * 디바이스 정보 포맷팅
 * @param {MediaDeviceInfo} device - 디바이스 정보
 * @returns {Object} 포맷된 디바이스 정보
 */
export const formatDeviceInfo = (device) => {
  return {
    id: device.deviceId,
    kind: device.kind,
    label: device.label || getDeviceDefaultName(device),
    groupId: device.groupId,
  };
};

/**
 * 디바이스 기본 이름 생성
 * @param {MediaDeviceInfo} device - 디바이스 정보
 * @returns {string} 기본 이름
 */
const getDeviceDefaultName = (device) => {
  const kindMap = {
    videoinput: '카메라',
    audioinput: '마이크',
    audiooutput: '스피커',
  };

  const baseName = kindMap[device.kind] || '장치';
  const shortId = device.deviceId.slice(0, 8);

  return `${baseName} (${shortId})`;
};

/**
 * 브라우저 미디어 지원 여부 확인
 * @returns {Object} 지원 기능 목록
 */
export const checkMediaSupport = () => {
  return {
    getUserMedia: !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    ),
    enumerateDevices: !!(
      navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
    ),
    setSinkId: !!HTMLMediaElement.prototype.setSinkId,
    getDisplayMedia: !!(
      navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
    ),
    deviceChange: !!(
      navigator.mediaDevices && 'ondevicechange' in navigator.mediaDevices
    ),
  };
};

/**
 * 디바이스 설정을 로컬 스토리지에 저장
 * @param {Object} deviceSettings - 저장할 디바이스 설정
 */
export const saveDeviceSettings = (deviceSettings) => {
  try {
    localStorage.setItem(
      'clov_device_settings',
      JSON.stringify(deviceSettings)
    );
    // console.log('디바이스 설정 저장 완료:', deviceSettings);
  } catch (error) {
    console.error('디바이스 설정 저장 실패:', error);
  }
};

/**
 * 로컬 스토리지에서 디바이스 설정 불러오기
 * @returns {Object|null} 저장된 디바이스 설정
 */
export const loadDeviceSettings = () => {
  try {
    const saved = localStorage.getItem('clov_device_settings');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('디바이스 설정 불러오기 실패:', error);
    return null;
  }
};

/**
 * 디바이스 테스트용 짧은 톤 재생
 * @param {string} outputDeviceId - 출력 디바이스 ID (선택사항)
 * @param {number} frequency - 주파수 (기본: 440Hz)
 * @param {number} duration - 지속시간 (기본: 0.5초)
 * @returns {Promise<void>}
 */
// export const playTestTone = async (
//   outputDeviceId = null,
//   frequency = 440,
//   duration = 0.5
// ) => {
//   try {
//     const audioContext = new (window.AudioContext ||
//       window.webkitAudioContext)();

//     // 출력 디바이스 설정 (지원하는 경우)
//     if (outputDeviceId && audioContext.setSinkId) {
//       await audioContext.setSinkId(outputDeviceId);
//     }

//     const oscillator = audioContext.createOscillator();
//     const gainNode = audioContext.createGain();

//     oscillator.connect(gainNode);
//     gainNode.connect(audioContext.destination);

//     oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
//     gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

//     // 페이드 아웃 효과
//     gainNode.gain.exponentialRampToValueAtTime(
//       0.01,
//       audioContext.currentTime + duration
//     );

//     oscillator.start();
//     oscillator.stop(audioContext.currentTime + duration);

//     // 정리
//     setTimeout(
//       () => {
//         audioContext.close();
//       },
//       (duration + 0.1) * 1000
//     );
//   } catch (error) {
//     console.error('테스트 톤 재생 실패:', error);
//     throw error;
//   }
// };

// deviceUtils.js의 playTestTone 함수에 로깅 추가
export const playTestTone = async (
  outputDeviceId = null,
  frequency = 440,
  duration = 0.5
) => {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // setSinkId 지원 여부 확인
    // console.log('AudioContext.setSinkId 지원:', !!audioContext.setSinkId);

    if (outputDeviceId && audioContext.setSinkId) {
      // console.log('스피커 설정 시도:', outputDeviceId);
      await audioContext.setSinkId(outputDeviceId);
      // console.log('스피커 설정 성공');
    } else {
      // console.log('setSinkId 미지원 또는 deviceId 없음');
    }

    // 나머지 코드...
  } catch (error) {
    console.error('테스트 톤 재생 실패:', error);
    throw error;
  }
};

export const playTestToneWithAudio = async (outputDeviceId, duration = 0.5) => {
  try {
    // 간단한 오디오 데이터 URL (440Hz 톤)
    const audioDataUrl =
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PoumkbBjaFdJIABdD3oQEAeY2+8+6LMwcTbLPs4p1NDAhImK6UpQMAaAYAAFqv5K6jVBIKQJnf6L9wHwMmctHx2YAzBRh3zuvdsTgHEGO35uadSgwKTJvf3bpxHQUweM/z24A2Bxl3yurdtT8JD2K28ORHDwotWKzY6qNJCgRJmNryxH0kBTGH2PLDdSMHK2LHg9WKLwgdbMDty5E5BxZ/xOvRkikIIHjS8NmNNggWbsHvyJY2CBhi0OjKnUAOEGDC9stpGAczbM7v1oU2BBxvvOffhDQFHm3M7d2ONgcfJnfX8eCFMAkZZL3n6plGCghKl9jwv4EwBht60O7CfC8EJnLX9YE3BRlwyOzSji4HHGy69l+TOgQda77v5o8xBhpozOzYkjMHGmG+6tlnGgoKUZjW7r2CNwUfb8rw1oo0Bh1sw+nXkTMHGWLA7NmIMwcaXsDs2Y4zBhphwezZjjMHGmHB69mOMwcZY8Hr2Y4zBxhfwu/YjjUGGGDB7NiOMwgYYcHs2Y4zBhhhwevZjjMHGWPB69mOMwYZYcHr2Y4zBhhjwevZjjMHGGHB69mNMwcZYsHr2o4zBxhhwevZjjMHGWPB69mNMwcZYcHr2Y4zBxhhwezZjjMHGWPB69mOMwcYYcHr2Y4zBxhjwevZjjMHGGHB69mOMwcZY8Hr2Y0zBxli';

    const audio = new Audio(audioDataUrl);

    if (outputDeviceId && audio.setSinkId) {
      // console.log('HTMLAudioElement로 스피커 설정 시도:', outputDeviceId);
      await audio.setSinkId(outputDeviceId);
      // console.log('HTMLAudioElement 스피커 설정 성공');
    }

    audio.volume = 0.3;
    await audio.play();

    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, duration * 1000);
  } catch (error) {
    console.error('HTMLAudioElement 테스트 실패:', error);
    throw error;
  }
};

/**
 * 마이크 볼륨 레벨 측정
 * @param {MediaStream} stream - 오디오 스트림
 * @param {Function} callback - 볼륨 레벨 콜백 (0-100)
 * @returns {Function} 측정 중지 함수
 */
export const measureAudioLevel = (stream, callback) => {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 512;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.8;

    microphone.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrame;

    const measure = () => {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }

      const average = sum / dataArray.length;
      const normalizedLevel = Math.min(Math.max(0, (average / 50) * 100), 100);

      callback(Math.round(normalizedLevel));
      animationFrame = requestAnimationFrame(measure);
    };

    measure();

    // 중지 함수 반환
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      audioContext.close();
    };
  } catch (error) {
    console.error('오디오 레벨 측정 실패:', error);
    return () => {}; // 빈 중지 함수 반환
  }
};

/**
 * 디바이스 권한 상태 확인
 * @returns {Promise<Object>} 권한 상태 객체
 */
export const checkDevicePermissions = async () => {
  const permissions = {
    camera: 'unknown',
    microphone: 'unknown',
  };

  try {
    if (navigator.permissions) {
      const cameraPermission = await navigator.permissions.query({
        name: 'camera',
      });
      const microphonePermission = await navigator.permissions.query({
        name: 'microphone',
      });

      permissions.camera = cameraPermission.state;
      permissions.microphone = microphonePermission.state;
    }
  } catch (error) {
    console.warn('권한 상태 확인 실패:', error);
  }

  return permissions;
};

/**
 * 기본 디바이스 ID 가져오기
 * @param {Array} devices - 디바이스 목록
 * @param {string} kind - 디바이스 종류
 * @returns {string|null} 기본 디바이스 ID
 */
export const getDefaultDeviceId = (devices, kind) => {
  const filtered = devices.filter((device) => device.kind === kind);

  if (filtered.length === 0) return null;

  // 'default' 라벨이 있는 디바이스 우선
  const defaultDevice = filtered.find(
    (device) =>
      device.label.toLowerCase().includes('default') ||
      device.deviceId === 'default'
  );

  return defaultDevice ? defaultDevice.deviceId : filtered[0].deviceId;
};

/**
 * 디바이스 변경 시 스트림 재생성
 * @param {MediaStream} oldStream - 기존 스트림
 * @param {Object} newDeviceIds - 새로운 디바이스 ID들
 * @returns {Promise<MediaStream>} 새로운 스트림
 */
export const recreateStream = async (oldStream, newDeviceIds) => {
  try {
    // 기존 스트림 정리
    if (oldStream) {
      oldStream.getTracks().forEach((track) => track.stop());
    }

    // 새 스트림 생성
    return await createStreamWithDevices(newDeviceIds);
  } catch (error) {
    console.error('스트림 재생성 실패:', error);
    throw error;
  }
};

/**
 * 디바이스 품질 프리셋
 */
export const QUALITY_PRESETS = {
  LOW: {
    video: {
      width: { ideal: 640, max: 640 },
      height: { ideal: 480, max: 480 },
      frameRate: { ideal: 15, max: 15 },
    },
    audio: {
      sampleRate: 22050,
      channelCount: 1,
    },
  },
  MEDIUM: {
    video: {
      width: { ideal: 1280, max: 1280 },
      height: { ideal: 720, max: 720 },
      frameRate: { ideal: 24, max: 24 },
    },
    audio: {
      sampleRate: 44100,
      channelCount: 1,
    },
  },
  HIGH: {
    video: {
      width: { ideal: 1920, max: 1920 },
      height: { ideal: 1080, max: 1080 },
      frameRate: { ideal: 30, max: 30 },
    },
    audio: {
      sampleRate: 48000,
      channelCount: 2,
    },
  },
};

/**
 * 품질 프리셋으로 스트림 생성
 * @param {Object} deviceIds - 디바이스 ID들
 * @param {string} quality - 품질 레벨 ('LOW', 'MEDIUM', 'HIGH')
 * @returns {Promise<MediaStream>} 미디어 스트림
 */
export const createStreamWithQuality = async (
  deviceIds,
  quality = 'MEDIUM'
) => {
  const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS.MEDIUM;

  try {
    const constraints = {};

    // ✅ 수정: video와 audio 중 최소 하나는 요청되어야 함
    let hasVideo = false;
    let hasAudio = false;

    if (deviceIds.videoInput) {
      constraints.video = {
        deviceId: { exact: deviceIds.videoInput },
        ...preset.video,
      };
      hasVideo = true;
    }

    if (deviceIds.audioInput) {
      constraints.audio = {
        deviceId: { exact: deviceIds.audioInput },
        ...preset.audio,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };
      hasAudio = true;
    }

    // ✅ 추가: video와 audio 중 아무것도 요청하지 않으면 에러
    if (!hasVideo && !hasAudio) {
      throw new Error('video 또는 audio 중 최소 하나는 활성화되어야 합니다.');
    }

    // ✅ 추가: 디바이스 ID가 없는 경우 기본값으로 대체
    if (!hasVideo && hasAudio) {
      // 오디오만 요청
      constraints.video = false;
    }

    if (hasVideo && !hasAudio) {
      // 비디오만 요청
      constraints.audio = false;
    }

    // console.log('🎥 스트림 요청 설정:', {
    //   hasVideo,
    //   hasAudio,
    //   quality,
    //   constraints: {
    //     video: constraints.video ? '활성화' : '비활성화',
    //     audio: constraints.audio ? '활성화' : '비활성화',
    //   },
    // });

    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('품질 기반 스트림 생성 실패:', error);

    // ✅ 개선된 에러 메시지
    if (error.name === 'NotAllowedError') {
      throw new Error(
        '카메라/마이크 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.'
      );
    } else if (error.name === 'NotFoundError') {
      throw new Error(
        '요청된 카메라/마이크를 찾을 수 없습니다. 디바이스 연결을 확인해주세요.'
      );
    } else if (error.name === 'NotReadableError') {
      throw new Error('카메라/마이크가 다른 애플리케이션에서 사용 중입니다.');
    } else {
      throw error;
    }
  }
};

/**
 * 디바이스 진단 정보 수집
 * @returns {Promise<Object>} 진단 정보
 */
export const collectDeviceDiagnostics = async () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    support: checkMediaSupport(),
    permissions: await checkDevicePermissions(),
    devices: null,
    errors: [],
  };

  try {
    diagnostics.devices = await getAvailableDevices();
  } catch (error) {
    diagnostics.errors.push(`디바이스 목록 오류: ${error.message}`);
  }

  return diagnostics;
};
