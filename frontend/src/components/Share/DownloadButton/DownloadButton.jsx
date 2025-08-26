/* eslint-disable */
import { useState } from 'react';
import { useRecordingStore, useRoomStore } from '../../../stores';

const DownloadButton = ({
  variant = 'overlay', // 'overlay' 타입 추가
  size = 'medium',
  showProgress = true,
  className = '',
}) => {
  const { recordedVideo, serverVideoUrl, recordedVideoBlob } =
    useRecordingStore();
  const { roomCode } = useRoomStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // 다운로드 가능한 소스가 있는지 확인
  const hasDownloadableContent =
    recordedVideoBlob || recordedVideo || serverVideoUrl;

  // 파일명 생성 함수
  const generateFileName = (type = 'webm') => {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[-:]/g, '');
    const randomId = Math.random().toString(36).substr(2, 6);
    const room = roomCode || 'room';

    return `clov_${room}_${timestamp}_${randomId}.${type}`;
  };

  // 다운로드 진행률 시뮬레이션
  const simulateProgress = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          setDownloadProgress(100);
          clearInterval(interval);
          resolve();
        } else {
          setDownloadProgress(progress);
        }
      }, 100);
    });
  };

  // 다운로드 핸들러
  const handleDownload = async () => {
    if (!hasDownloadableContent) {
      alert('다운로드할 파일이 없습니다.');
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // 진행률 시뮬레이션
      if (showProgress) {
        await simulateProgress();
      }

      let downloadUrl;
      let fileName = generateFileName();

      // 우선순위: Blob → recordedVideo → serverVideoUrl
      if (recordedVideoBlob) {
        downloadUrl = URL.createObjectURL(recordedVideoBlob);
      } else if (recordedVideo && recordedVideo.startsWith('blob:')) {
        downloadUrl = recordedVideo;
      } else if (serverVideoUrl) {
        const response = await fetch(serverVideoUrl);
        const blob = await response.blob();
        downloadUrl = URL.createObjectURL(blob);

        // Content-Type에서 파일 확장자 추출
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('image')) {
          fileName = generateFileName('png');
        }
      } else {
        throw new Error('다운로드 가능한 소스가 없습니다.');
      }

      // 다운로드 실행
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Blob URL 정리
      if (downloadUrl !== recordedVideo && downloadUrl.startsWith('blob:')) {
        URL.revokeObjectURL(downloadUrl);
      }

      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    } catch (error) {
      /* console.error('다운로드 중 오류 발생:', error); */
      alert('다운로드 중 오류가 발생했습니다.');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    // 원래 디자인 className 첫줄 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full
    <button
      onClick={handleDownload}
      disabled={!hasDownloadableContent || isDownloading}
      className={`
          bg-green-600 bg-opacity-90 hover:bg-green-700 hover:bg-opacity-100 text-white px-6 py-2 rounded
          transition-all duration-200 hover:scale-105
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
          shadow-lg hover:shadow-xl
          ${className}
        `}
      title={
        isDownloading
          ? `다운로드 중... ${Math.round(downloadProgress)}%`
          : !hasDownloadableContent
            ? '다운로드할 파일이 없습니다'
            : '다운로드'
      }
    >
      <span className='flex items-center gap-2'>
        {isDownloading ? '⏳' : '📥'}
        {isDownloading ? '다운로드 중...' : '다운로드'}
      </span>
    </button>
  );
};

export default DownloadButton;
