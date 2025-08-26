/* eslint-disable */
import React, { useState } from 'react';
import Button from '../../../../components/common/Button/Button';
import EntryConsentModal from '../../../../components/Room/EntryConsentModal/EntryConsentModal';
import PWAInstallModal from '../../../../components/common/PWAInstallModal/PWAInstallModal';
import { usePWAInstall } from '../../../../hooks/usePWAInstall';
import toast from 'react-hot-toast';

const ActionButtons = ({
  roomCode,
  setRoomCode,
  isLoading,
  showCreateConsent,
  setShowCreateConsent,
  showJoinConsent,
  setShowJoinConsent,
  handleCreateClick,
  handleJoinClick,
  handleKeyPress,
  handleCreateAgree,
  handleJoinAgree,
}) => {
  // PWA 설치 관련 상태
  const { canInstall, isIOS, isLoading: isPWALoading, installPWA } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // PWA 설치 버튼 클릭 핸들러
  const handlePWAInstall = async () => {
    if (isIOS) {
      // iOS인 경우 설치 안내 모달 표시
      setShowIOSModal(true);
    } else {
      // Chrome/Edge인 경우 직접 설치
      const result = await installPWA();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    }
  };
  return (
    <div className='flex flex-col pr-4 sm:pr-12 md:pr-20'>
      {/* 방 생성하기 - 반응형 크기 */}
      <Button
        variant='primary'
        className='px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-base sm:text-lg w-full'
        onClick={handleCreateClick}
        disabled={isLoading}
        style={{
          border: 'none',
          borderRadius: 'var(--border-radius-xl)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span className={isLoading ? 'opacity-70' : ''}>
          {isLoading ? '방 생성 중...' : '방 생성하기'}
        </span>
      </Button>

      {/* 구분선 - 반응형 간격 */}
      <div className='relative text-center my-3 sm:my-3.5 md:my-4'>
        <div className='absolute inset-0 flex items-center'></div>
        <div className='relative px-4'>
          <span
            className='text-sm'
            style={{ color: 'var(--color-text-secondary)' }}
          >
            또는
          </span>
        </div>
      </div>

      {/* 방 참여하기 - 모바일에서는 세로 배치 */}
      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 w-full'>
        <input
          type='text'
          placeholder='방 코드 입력'
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          onKeyPress={handleKeyPress}
          className='flex-1 py-3 sm:py-3.5 md:py-4 px-3 sm:px-4 text-base sm:text-lg transition-colors duration-300 focus:outline-none disabled:cursor-not-allowed'
          style={{
            border: '1px solid var(--color-input-border)',
            borderRadius: 'var(--border-radius-xl)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'var(--color-input-text)',
            backdropFilter: 'blur(8px)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor =
              'var(--color-input-border-focus)';
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-input-border)';
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          }}
          maxLength={6}
          disabled={isLoading}
        />
        <Button
          variant='secondary'
          onClick={handleJoinClick}
          className='px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 text-base sm:text-lg whitespace-nowrap w-full sm:w-auto'
          style={{
            border: 'none',
            borderRadius: 'var(--border-radius-xl)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            minWidth: '0',
          }}
        >
          <span className={isLoading ? 'opacity-70' : ''}>
            {isLoading ? '참여 중...' : '참여하기'}
          </span>
        </Button>
        
        <EntryConsentModal
          isOpen={showCreateConsent}
          onAgree={handleCreateAgree}
          onDecline={() => setShowCreateConsent(false)}
        />

        <EntryConsentModal
          isOpen={showJoinConsent}
          onAgree={handleJoinAgree}
          onDecline={() => setShowJoinConsent(false)}
        />
      </div>

      {/* PWA 설치 버튼 - 설치 가능할 때만 표시 */}
      {canInstall && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={handlePWAInstall}
            disabled={isLoading || isPWALoading}
            loading={isPWALoading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-base sm:text-lg font-semibold transition-all duration-200"
            style={{
              borderRadius: 'var(--border-radius-xl)',
              backdropFilter: 'blur(8px)',
              backgroundColor: isHovering ? 'var(--color-primary)' : 'rgba(0, 0, 0, 0.15)',
              borderColor: 'var(--color-primary)',
              color: isHovering ? '#333333' : '#FFE066',
              borderWidth: '2px',
            }}
          >
            앱으로 설치하기
          </Button>
        </div>
      )}

      {/* iOS 설치 안내 모달 */}
      <PWAInstallModal 
        isOpen={showIOSModal} 
        onClose={() => setShowIOSModal(false)} 
      />
    </div>
  );
};

export default ActionButtons;