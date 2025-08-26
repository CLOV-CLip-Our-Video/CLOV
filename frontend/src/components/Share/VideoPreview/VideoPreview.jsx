/* eslint-disable */
import { useState, useRef, useEffect } from 'react';
import { useRecordingStore } from '../../../stores';
import styles from './VideoPreview.module.css';

const VideoPreview = () => {
  const {
    recordedVideo, // Blob URL (즉시 미리보기용)
    serverVideoUrl, // 서버 URL (히스토리/공유용)
    isUploading, // 서버 업로드 진행 상태
    uploadProgress, // 업로드 진행률
  } = useRecordingStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);

  // 비디오 소스 우선순위: Blob URL → 서버 URL
  const videoSrc = recordedVideo || serverVideoUrl;

  // 비디오 메타데이터 로드 시
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // 재생 시간 업데이트
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 1. 재생/일시정지 토글 - 플레이어 내부로 이동
  const togglePlay = () => {
    if (videoRef.current && !videoError) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 시간 포맷팅 (MM:SS)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 시크바 클릭
  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 컨트롤 숨기기/보이기
  useEffect(() => {
    let timeout;
    if (isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // 녹화된 비디오가 없는 경우
  if (!videoSrc) {
    return (
      <div
        className={`
        w-full max-w-8xl mx-auto
        bg-gray-100 rounded-large
        border-2 border-dashed border-gray-300
        flex flex-col items-center justify-center
        h-64 md:h-80
      `}
      >
        <div className='text-6xl mb-4 text-gray-400'>🎬</div>
        <p className='text-secondary text-lg'>녹화된 영상이 없습니다</p>
        <p className='text-light text-sm mt-2'>
          녹화를 완료하면 여기에 미리보기가 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
      w-full max-w-2xl mx-auto
      bg-card rounded-large shadow-card
      overflow-hidden
      ${styles.videoContainer}
    `}
    >
      {/* 업로드 진행 상태 표시 */}
      {isUploading && (
        <div
          style={{ backgroundColor: 'var(--color-primary-opacity-20)' }}
          className='p-3 text-center'
        >
          <div
            className='flex items-center justify-center gap-2 text-sm font-medium'
            style={{ color: 'var(--color-primary-darker)' }}
          >
            <svg
              className='w-4 h-4 animate-spin'
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
            서버에 저장 중... {uploadProgress || 0}%
          </div>
          <div className='w-full bg-white rounded-full h-2 mt-2'>
            <div
              className='h-2 rounded-full transition-all duration-300'
              style={{
                backgroundColor: 'var(--color-primary-darker)',
                width: `${uploadProgress || 0}%`,
              }}
            />
          </div>
          <p
            className='text-xs mt-1'
            style={{ color: 'var(--color-primary-dark)' }}
          >
            💾 히스토리에 보관되어 30분간 다시 접근할 수 있습니다
          </p>
        </div>
      )}

      {/* 서버 저장 완료 알림 */}
      {!isUploading && serverVideoUrl && (
        <div
          style={{ backgroundColor: 'var(--color-success)', opacity: 0.1 }}
          className='p-3 text-center'
        >
          <p
            className='text-sm font-medium flex items-center justify-center gap-2'
            style={{ color: 'var(--color-success)' }}
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            히스토리에 저장 완료! 30분간 접근 가능
          </p>
        </div>
      )}

      {/* 비디오 영역 */}
      <div
        className='relative bg-black group cursor-pointer'
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className='w-full h-auto max-h-80'
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onError={() => setVideoError(true)}
        />

        {/* 비디오 에러 처리 */}
        {videoError && (
          <div className='absolute inset-0 flex items-center justify-center bg-gray-800 text-white'>
            <div className='text-center'>
              <svg
                className='w-12 h-12 mx-auto mb-2 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <p>영상을 불러올 수 없습니다</p>
              <button
                onClick={() => {
                  setVideoError(false);
                  videoRef.current?.load();
                }}
                className='mt-2 px-3 py-1 rounded text-sm'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 1. 재생 버튼 - 에러가 없을 때만 표시 */}
        {!videoError && (
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-300 ease-in-out
              ${
                showControls
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              }
            `}
            onClick={togglePlay}
          >
            {/* 중앙 재생/일시정지 버튼 */}
            <div
              className={`
                relative transform transition-all duration-200 ease-out
                ${isPlaying ? 'scale-90' : 'scale-100 hover:scale-110'}
              `}
            >
              {/* 글로우 효과 */}
              <div
                className='absolute inset-0 rounded-full blur-md opacity-30'
                style={{
                  backgroundColor: 'var(--color-primary)',
                  animation: isPlaying ? 'none' : 'pulse 2s infinite',
                }}
              />

              {/* 메인 버튼 */}
              <div
                className={`
                  relative w-20 h-20 rounded-full
                  flex items-center justify-center
                  backdrop-blur-sm border-2
                  transition-all duration-200
                  ${
                    isPlaying
                      ? 'bg-black bg-opacity-40 border-white border-opacity-60'
                      : 'bg-white bg-opacity-95 border-white shadow-lg'
                  }
                `}
              >
                {isPlaying ? (
                  // 일시정지 아이콘
                  <svg
                    className='w-8 h-8 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <rect x='6' y='4' width='4' height='16' rx='1' />
                    <rect x='14' y='4' width='4' height='16' rx='1' />
                  </svg>
                ) : (
                  // 재생 아이콘
                  <div className='relative'>
                    <svg
                      className='w-10 h-10 ml-1'
                      fill='var(--color-primary-darker)'
                      viewBox='0 0 24 24'
                    >
                      <path d='M8 5.14v14l11-7z' />
                    </svg>
                  </div>
                )}
              </div>

              {/* 재생 중 추가 효과 */}
              {isPlaying && (
                <div className='absolute inset-0 rounded-full border-2 border-white border-opacity-30 animate-ping' />
              )}
            </div>
          </div>
        )}

        {/* 하단 미니 컨트롤 바 (시크바 + 시간) */}
        <div
          className={`
            absolute bottom-0 left-0 right-0
            bg-gradient-to-t from-black to-transparent
            p-4 transition-all duration-300
            ${
              showControls
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }
          `}
        >
          {/* 시크바 */}
          <div className='mb-2'>
            <div
              className='w-full h-1 bg-white bg-opacity-30 rounded-full cursor-pointer hover:h-2 transition-all'
              onClick={handleSeek}
            >
              <div
                className='h-full rounded-full transition-all duration-100'
                style={{
                  backgroundColor: 'var(--color-primary)',
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 시간 표시 */}
          <div className='flex justify-between items-center text-white text-sm'>
            <span>{formatTime(currentTime)}</span>
            <span className='opacity-70'>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* 3. 하단 패널 - 꾸밈 요소로 변경 */}
      <div
        className='px-4 py-3 text-center border-t'
        style={{
          backgroundColor: 'var(--color-card-background)',
          borderColor: 'var(--border-color-default)',
        }}
      >
        <p className='text-xs text-[var(--color-text-light)] flex items-center justify-center gap-1'>
          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
          클릭하여 재생 • 마우스 휠로 시간 이동
        </p>
      </div>
    </div>
  );
};

export default VideoPreview;
