/* eslint-disable */
import { useState, useEffect } from 'react';
import {
  VideoPreview,
  DownloadButton,
  SocialShare,
} from '../../../../components/Share';
import { useRecordingStore } from '../../../../stores';
import Button from '../../../../components/common/Button/Button.jsx';
import Modal from '../../../../components/common/Modal/Modal.jsx';
import { showToast } from '../../../../components/common/Toast/toast.js';
import styles from './SaveModal.module.css';

const SaveModal = ({
  isOpen,
  onClose,
  onContinueRecording,
  capturedMedia, // 새로 추가: 촬영된 미디어 데이터
}) => {
  const { serverVideoUrl, uploadError } = useRecordingStore();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 🆕 미리보기 URL 생성 (capturedMedia가 있을 때)
  useEffect(() => {
    if (capturedMedia?.blob) {
      const url = URL.createObjectURL(capturedMedia.blob);
      setPreviewUrl(url);

      // 정리 함수
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
  }, [capturedMedia]);

  // 🆕 다운로드 기능
// 🔧 수정된 다운로드 함수 - 원본 Blob을 그대로 사용
const handleDownload = async () => {
  if (!capturedMedia?.blob) {
    showToast('error', '다운로드할 파일이 없습니다.', {
      duration: 2000,
      position: 'top-center',
    });
    return;
  }
  /* console.log('SaveModal에서 받은 blob:', capturedMedia.blob.type); */
  setIsDownloading(true);

  try {
    // 🚨 핵심 수정: 원본 Blob을 그대로 사용 (새로 생성하지 않음)
    const originalBlob = capturedMedia.blob;
    
    console.log('📥 다운로드할 원본 Blob 정보:', {
      type: originalBlob.type,
      size: originalBlob.size
    });

    // Blob을 다운로드 가능한 URL로 변환
    const url = URL.createObjectURL(originalBlob);

    // 🆕 올바른 확장자로 파일명 생성
    const getFileName = () => {
      if (capturedMedia.fileName) {
        return capturedMedia.fileName;
      }
      
      const timestamp = capturedMedia.timestamp || Date.now();
      if (capturedMedia.type === 'photo') {
        return `CLOV_photo_${timestamp}.png`;
      }
      
      // 🔧 실제 MIME 타입에서 확장자 추출
      const mimeType = originalBlob.type;
      let extension = 'mp4'; // 기본값
      
      if (mimeType.includes('mp4')) {
        extension = 'mp4';
      } else if (mimeType.includes('webm')) {
        extension = 'webm';
      } else if (mimeType.includes('mov')) {
        extension = 'mov';
      }
      
      return `CLOV_video_${timestamp}.${extension}`;
    };

    const fileName = getFileName();

    // 임시 링크 요소 생성
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // 다운로드 실행
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URL 정리
    URL.revokeObjectURL(url);

    // 🆕 실제 포맷 정보로 성공 메시지
    const formatName = originalBlob.type.includes('mp4') ? 'MP4' : 
                     originalBlob.type.includes('webm') ? 'WebM' : '비디오';
    const mediaType = capturedMedia.type === 'photo' ? '사진' : `영상 (${formatName})`;
    
    showToast('success', `${mediaType}이 다운로드되었습니다!`, {
      duration: 2000,
      position: 'top-center',
    });

    console.log('✅ 다운로드 완료:', {
      fileName: fileName,
      originalMimeType: originalBlob.type,
      size: originalBlob.size
    });

  } catch (error) {
    /* console.error('❌ 다운로드 실패:', error); */
    showToast('error', '다운로드에 실패했습니다: ' + error.message, {
      duration: 3000,
      position: 'top-center',
    });
  } finally {
    setIsDownloading(false);
  }
};
  // 🆕 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        capturedMedia
          ? `${capturedMedia.type === 'photo' ? '사진 촬영' : '영상 녹화'} 완료!`
          : '녹화 완료!'
      }
      size='medium'
      className={`${styles.saveModal} overflow-hidden`}
    >
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div
        className={`max-h-[75vh] overflow-y-auto px-1 ${styles.scrollableContent}`}
      >

        {/* 🆕 촬영된 미디어가 있을 때의 미리보기 */}
        {capturedMedia && previewUrl ? (
          <div className='mb-6 mt-4'>
            <div className='relative max-w-8xl mx-auto'>
              {/* 촬영된 미디어 미리보기 */}
              <div className='bg-black rounded-lg overflow-hidden'>
                {capturedMedia.type === 'photo' ? (
                  <img
                    src={previewUrl}
                    alt='촬영된 사진'
                    className='w-full h-auto max-h-64 object-contain mx-auto'
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className='w-full h-auto max-h-64 mx-auto'
                    style={{ maxWidth: '400px' }}
                  >
                    브라우저에서 비디오를 지원하지 않습니다.
                  </video>
                )}
              </div>

            </div>

            {/* 🆕 파일 정보 표시 */}
            <div className='mt-4 p-3 bg-gray-100 rounded-lg text-sm'>
              <div className='space-y-1'>
                <div>
                  <strong>파일명:</strong> {capturedMedia.fileName}
                </div>
                <div>
                  <strong>타입:</strong>{' '}
                  {capturedMedia.type === 'photo' ? '사진' : '영상'}
                </div>
                <div>
                  <strong>크기:</strong>{' '}
                  {formatFileSize(capturedMedia.blob?.size || 0)}
                </div>
                <div>
                  <strong>촬영 시간:</strong>{' '}
                  {new Date(capturedMedia.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 기존 VideoPreview 사용 (서버 영상일 때)
          <div className='mb-6 mt-4'>
            <div className='relative max-w-8xl mx-auto'>
              <VideoPreview />

            </div>
          </div>
        )}


        {/* 하단 안내 및 버튼 */}
        <div className={styles.bottomSection}>
          {/* 서버 저장 성공시에만 히스토리 안내 표시 */}
          {!uploadError && serverVideoUrl && (
            <div className='text-center pt-4 border-t border-[var(--border-color-default)] mb-4'>
              <p className='text-xs text-[var(--color-text-light)]'>
                ✨ 이 영상은 30분간 방 히스토리에 보관됩니다
              </p>
            </div>
          )}


          {/* 다운로드와 계속 촬영하기 버튼을 가로로 배치 */}
          <div className='flex justify-center gap-4 px-4 pb-2'>
            {capturedMedia && (
              <Button
                variant='success'
                size='medium'
                onClick={handleDownload}
                disabled={isDownloading}
                className='px-6'
              >
                <span className='flex items-center gap-2'>
                  {isDownloading ? '⏳' : ''}
                  {isDownloading ? '다운로드 중...' : '다운로드'}
                </span>
              </Button>
            )}
            {!capturedMedia && (
              <DownloadButton showProgress={true} />
            )}
            <Button
              variant={Button.Variants.PRIMARY}
              size={Button.Sizes.MEDIUM}
              onClick={onContinueRecording}
              className='px-6'
            >
              계속 촬영하기
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SaveModal;
