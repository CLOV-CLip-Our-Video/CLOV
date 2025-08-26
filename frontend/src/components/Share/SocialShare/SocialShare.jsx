/* eslint-disable */
import { useState, useEffect } from 'react';
import { useRecordingStore, useRoomStore } from '../../../stores';

const SocialShare = ({
  variant = 'full', // 'overlay' 또는 'full'
  shareUrl,
  title = 'CLOV에서 함께 찍은 추억',
  description = '언제 어디서든 함께 모이고, 찍고, 바로 공유하는 온라인 포토 부스',
  className = '',
}) => {
  const { serverVideoUrl, isUploading } = useRecordingStore();
  const { roomCode } = useRoomStore();
  const [copied, setCopied] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // 공유 URL 생성
  const getShareUrl = () => {
    if (shareUrl) return shareUrl;
    if (serverVideoUrl) return serverVideoUrl;
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${roomCode}`;
  };

  // 공유 가능 여부 확인
  const canShare = serverVideoUrl && !isUploading;

  // 클립보드 복사
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      /* console.error('클립보드 복사 실패:', error); */
      // 폴백: prompt 사용
      const url = getShareUrl();
      if (window.prompt) {
        prompt('공유 링크를 복사하세요:', url);
      }
    }
  };

  // 공유 핸들러
  const handleShare = async () => {
    if (!canShare) {
      if (isUploading) {
        alert('업로드가 완료된 후 공유할 수 있습니다.');
      } else {
        alert('서버에 저장된 후 공유할 수 있습니다.');
      }
      return;
    }

    // 네이티브 공유 API 시도
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: getShareUrl(),
        });
        return;
      } catch (error) {
        if (error.name !== 'AbortError') {
          /* console.error('네이티브 공유 실패:', error); */
        }
      }
    }

    // 폴백: 클립보드 복사
    await copyToClipboard();
    if (copied) {
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  // 오버레이 버전 렌더링
  if (variant === 'overlay') {
    return (
      <button
        onClick={handleShare}
        disabled={!canShare}
        className={`
          bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full
          transition-all duration-200 hover:scale-110
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
          ${className}
        `}
        title={
          isUploading
            ? '업로드 중...'
            : !serverVideoUrl
              ? '서버 저장 완료 후 공유 가능'
              : copied
                ? '링크 복사됨!'
                : '공유하기'
        }
      >
        {isUploading ? (
          <svg
            className='w-5 h-5 animate-spin text-white'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        ) : copied ? (
          <svg
            className='w-5 h-5 text-green-400 drop-shadow-sm'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        ) : (
          <svg
            className='w-5 h-5 text-white drop-shadow-sm'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2.5'
              d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
            />
          </svg>
        )}
      </button>
    );
  }

  // 30분 카운트다운 계산 (풀 버전에서만)
  useEffect(() => {
    if (variant === 'full') {
      const expiryTime = Date.now() + 30 * 60 * 1000;

      const interval = setInterval(() => {
        const remaining = expiryTime - Date.now();
        if (remaining > 0) {
          const minutes = Math.floor(remaining / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining('만료됨');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [variant]);

  // 풀 버전 렌더링 (기존 코드 유지)
  return (
    <div
      className={`
      bg-card rounded-large shadow-card p-6
      max-w-md mx-auto
    `}
    >
      {/* 기존 풀 버전 코드... */}
      <div className='text-center mb-6'>
        <h3 className='text-xl font-bold text-primary-dark mb-2'>
          추억을 공유해보세요! 🎉
        </h3>
        <p className='text-secondary text-sm'>
          친구들과 함께 찍은 소중한 순간을 나눠보세요
        </p>
      </div>

      {/* URL 공유 섹션 */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-secondary mb-2'>
          공유 링크
        </label>
        <div className='flex gap-2'>
          <input
            type='text'
            value={getShareUrl()}
            readOnly
            className='flex-1 px-3 py-2 text-sm bg-gray-50 border border-default rounded-medium text-secondary truncate focus:outline-none focus:border-primary'
          />
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-medium transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-primary text-primary-text hover:bg-primary-dark'
            }`}
          >
            {copied ? (
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            ) : (
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 네이티브 공유 */}
      {navigator.share && (
        <button
          onClick={handleShare}
          disabled={!canShare}
          className='w-full flex items-center justify-center gap-2 p-3 rounded-medium bg-primary text-primary-text hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
            />
          </svg>
          공유하기
        </button>
      )}

      {timeRemaining && (
        <div className='mt-4 pt-4 border-t border-default'>
          <div className='flex items-center justify-between text-xs'>
            <p className='text-light'>💡 링크 유효시간</p>
            <p
              className={`font-mono font-medium ${
                timeRemaining === '만료됨' ? 'text-error' : 'text-warning'
              }`}
            >
              {timeRemaining}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShare;
