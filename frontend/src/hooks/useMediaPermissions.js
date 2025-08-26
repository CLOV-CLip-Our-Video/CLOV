// frontend/src/hooks/useMediaPermissions.js
/* eslint-disable */
import { useEffect, useMemo, useState, useCallback } from 'react';

const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent);
const isAndroid = () => /Android/.test(navigator.userAgent);
const hasPermissionsAPI = () =>
  !!(navigator.permissions && navigator.permissions.query);

export default function useMediaPermissions() {
  const [camera, setCamera] = useState('prompt'); // 'granted' | 'denied' | 'prompt' | 'unknown'
  const [microphone, setMicrophone] = useState('prompt');
  const [loading, setLoading] = useState(true);

  const read = useCallback(async () => {
    setLoading(true);
    try {
      if (hasPermissionsAPI()) {
        const [cam, mic] = await Promise.allSettled([
          navigator.permissions.query({ name: 'camera' }),
          navigator.permissions.query({ name: 'microphone' }),
        ]);

        setCamera(cam.status === 'fulfilled' ? cam.value.state : 'unknown');
        setMicrophone(mic.status === 'fulfilled' ? mic.value.state : 'unknown');
      } else {
        // Fallback: 보수적으로 'prompt'로 간주
        setCamera('prompt');
        setMicrophone('prompt');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    read();
  }, [read]);

  // 사용자 제스처 안에서 호출: 재요청
  const requestBoth = useCallback(async () => {
    // 중요한 점: 반드시 버튼 onClick 등 사용자 입력 핸들러 내부에서 이 함수를 호출해야 팝업이 뜬다.
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      await read(); // 상태 갱신
      return true;
    } catch (e) {
      await read(); // 거부 시 상태 갱신
      return false;
    }
  }, [read]);

  const platformHelp = useMemo(() => {
    if (isIOS()) {
      return {
        os: 'iOS',
        steps: [
          '설정 앱 열기',
          'Safari → 카메라/마이크',
          '“허용(Allow)”으로 변경',
          '이후 현재 화면으로 돌아와 페이지 새로고침',
        ],
      };
    }
    if (isAndroid()) {
      return {
        os: 'Android',
        steps: [
          '주소창 자물쇠 아이콘 탭',
          '권한/사이트 설정',
          '카메라/마이크 “허용”',
          '뒤로 이동 후 페이지 새로고침',
        ],
      };
    }
    return {
      os: 'Desktop/Mobile',
      steps: [
        '주소창 자물쇠 → 사이트 설정',
        '카메라/마이크 “허용”',
        '페이지 새로고침',
      ],
    };
  }, []);

  return {
    loading,
    state: { camera, microphone },
    isDenied: camera === 'denied' || microphone === 'denied',
    isPrompt: camera === 'prompt' || microphone === 'prompt',
    isGranted: camera === 'granted' && microphone === 'granted',
    requestBoth, // 반드시 onClick 등에서 사용
    refresh: read,
    platformHelp,
  };
}
