import { useState, useEffect, useCallback } from 'react';

/**
 * PWA 설치 기능을 관리하는 커스텀 훅
 * @returns {Object} PWA 설치 관련 상태와 함수들
 */
export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // iOS 및 Standalone 모드 감지
  useEffect(() => {
    const detectPlatform = () => {
      // iOS 감지
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      // Standalone 모드 감지 (이미 설치된 상태)
      const isInStandaloneMode = 
        window.navigator.standalone === true || // iOS Safari
        window.matchMedia('(display-mode: standalone)').matches; // Chrome/Edge

      setIsIOS(isIOSDevice);
      setIsStandalone(isInStandaloneMode);
      setIsInstalled(isInStandaloneMode);
    };

    detectPlatform();
  }, []);

  // beforeinstallprompt 이벤트 리스너
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // 기본 브라우저 설치 프롬프트 방지
      e.preventDefault();
      
      // 나중에 사용할 수 있도록 이벤트 저장
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // 앱이 설치된 후 호출됨
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // PWA 설치 함수
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      return { success: false, error: '설치를 할 수 없습니다.' };
    }

    setIsLoading(true);

    try {
      // 설치 프롬프트 표시
      deferredPrompt.prompt();
      
      // 사용자의 선택 대기
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        setIsLoading(false);
        return { success: true, message: 'CLOV 앱이 성공적으로 설치되었습니다!' };
      } else {
        setIsLoading(false);
        return { success: false, error: '설치가 취소되었습니다.' };
      }
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: '설치 중 오류가 발생했습니다: ' + error.message 
      };
    }
  }, [deferredPrompt]);

  // iOS Safari에서 설치 안내를 위한 함수
  const showIOSInstallGuide = useCallback(() => {
    return {
      isIOS: true,
      steps: [
        '🔗 Safari에서 하단의 공유 버튼을 탭하세요',
        '📱 "홈 화면에 추가"를 선택하세요',
        '✅ "추가"를 탭하여 CLOV 앱을 설치하세요'
      ]
    };
  }, []);

  // 설치 가능 여부 확인
  const canInstall = !isStandalone && !isInstalled && (isInstallable || isIOS);

  return {
    // 상태
    isInstallable,
    isInstalled,
    isLoading,
    isIOS,
    isStandalone,
    canInstall,
    
    // 함수
    installPWA,
    showIOSInstallGuide,
  };
};