/* eslint-disable */
import React, { useEffect } from 'react';
import { SpaceBackground, LogoSection, IntroSection, ActionButtons, ServiceDescription } from './components';
import { useFallingAliens, useKeyboardEasterEgg, useRoomActions, useScrollSnap } from './hooks';
import { useRoomStore } from '../../stores';
import { closeSocket } from '../../services/socket';
import pookieBanner from '../../assets/images/landing/pookie_banner.png';
const LandingPage = () => {
  const { fallingAliens, dropAlien, screenShake, goldenParticles } = useFallingAliens();
  const roomActions = useRoomActions();
  const containerRef = useScrollSnap();
  
  // 일반 스페이스바: 랜덤 외계인, Shift+스페이스바: 황금 외계인 강제 등장
  const handleSpacePress = () => {
    dropAlien(false);
  };
  
  const handleShiftSpacePress = () => {
    dropAlien(true);
  };
  
    // 외부 사이트 리다이렉션 핸들러
  const handleExternalLinkClick = () => {
    window.open('your-url', '_blank'); // 원하는 URL로 변경
  };

  // 이벤트 응모 구글폼 핸들러
  const handleEventFormClick = () => {
    window.open('https://forms.gle/Gk4HWhStHTb9SjW57', '_blank');
  };

  useKeyboardEasterEgg(handleSpacePress, handleShiftSpacePress);

  useEffect(() => {
    closeSocket(); // ✅ 진입 시 소켓 연결 종료
    useRoomStore.getState().resetRoom(); // ✅ 진입 시 상태 초기화
  }, []);

  return (
    <>
      {/* iOS 전용 스타일 */}
      <style>{`
        /* iOS에서 elastic scrolling과 bounce 효과 방지 */
        html, body {
          overscroll-behavior: none;
          -webkit-overflow-scrolling: auto;
        }
        
        @supports (-webkit-touch-callout: none) {
          /* iOS Safari 전용 스타일 */
          html {
            touch-action: manipulation;
          }
        }
      `}</style>
      
      <div
        ref={containerRef}
        className='relative overflow-y-auto'
        style={{
          backgroundColor: 'var(--color-background)',
          height: '100vh',
          // iOS 전용 스크롤 제어
          overscrollBehavior: 'none',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'auto', // iOS momentum scrolling 비활성화
          animation: screenShake ? 'screenShake 0.8s ease-in-out' : 'none',
        }}
      >


      <div className='h-[200vh]'>
        <div className='absolute inset-0 w-full h-full z-0'>
          <SpaceBackground fallingAliens={fallingAliens} goldenParticles={goldenParticles} />
        </div>

        {/* 첫 번째 섹션 - 메인 컨텐츠 */}
        <section 
          className='relative z-10 flex items-center justify-start p-4 sm:p-6 md:p-8'
          style={{ 
            scrollSnapAlign: 'start',
            height: '100vh',
            minHeight: '100vh'
          }}
        >
          {/* 🎯 외부 링크 이미지 - 섹션1 좌측하단에만 고정 */}
            <div className='absolute bottom-4 right-4 z-20 hidden md:block'>
              <button
                onClick={handleExternalLinkClick}
                className='external-link-image'
                aria-label='외부 사이트로 이동'
              >
                <img
                  src={pookieBanner}
                  alt='Pookie Banner'
                  className='h-30 sm:h-40 w-auto rounded-lg object-contain'
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                    maxWidth: '200px', // 최대 너비 제한
                  }}
                />
              </button>
            </div>

            {/* 이벤트 응모 버튼 - 작은 패널 형태 */}
            <div className='absolute bottom-4 left-4 z-20'>
              <button
                onClick={handleEventFormClick}
                className='text-xs sm:text-sm px-3 py-2 rounded-full transition-all duration-300 hover:scale-105'
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-darker), var(--color-warning))',
                  color: 'var(--color-button-text)',
                  boxShadow: 'var(--shadow-button)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = 'var(--shadow-hover)';
                  e.target.style.background = 'linear-gradient(135deg, var(--color-primary-dark), var(--color-warning))';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'var(--shadow-button)';
                  e.target.style.background = 'linear-gradient(135deg, var(--color-primary-darker), var(--color-warning))';
                }}
                aria-label='이벤트 응모하기'
              >
                이벤트 응모
              </button>
            </div>
        {/* 로고 + 왼쪽 콘텐츠 통합 영역 */}
        <div className='flex-1 max-w-sm sm:max-w-md md:max-w-xl flex flex-col justify-center pl-2 sm:pl-4 md:pl-8 ml-2 sm:ml-3 md:ml-4'>
          <LogoSection />
          <IntroSection />
          <ActionButtons {...roomActions} />
        </div>

        {/* 우측은 이미지가 보이는 공간 - 모바일에서는 숨김 */}
        <div className='hidden sm:flex flex-1'></div>
      </section>

        {/* 두 번째 섹션 - 서비스 설명 */}
        <section 
          className='relative z-10 flex items-center justify-center px-4 py-8'
          style={{ 
            scrollSnapAlign: 'start',
            height: '100vh',
            minHeight: '100vh'
          }}
        >
          <ServiceDescription />
        </section>
      </div>
      </div>
    </>
  );
};

export default LandingPage;