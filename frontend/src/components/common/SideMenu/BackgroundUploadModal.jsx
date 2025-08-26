import React, { useState, useRef } from 'react';
import { showToast } from '../Toast/toast';

import {
  getPresignedBackgroundUploadUrl,
  changeBackground,
  validateFile,
} from '@/services/apiUtils';
import { useRoomStore } from '../../../stores';

const BackgroundUploadModal = ({
  isOpen,
  onClose,
  roomCode,
  onUploadSuccess,
  isHost,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef(null);

  const { clientId } = useRoomStore();

  /**
   * S3에 파일 업로드
   * @param {File} file - 업로드할 파일
   * @param {string} presignedUrl - Presigned URL
   * @returns {Promise} 업로드 성공 여부
   */
  const uploadFileToS3 = async (file, presignedUrl) => {
    try {
      // console.log('S3 업로드 시작:', {
      //   fileType: file.type,
      //   fileSize: file.size,
      //   presignedUrl: presignedUrl,
      // });
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'image/png', // 서버와 맞춤 (고정값)
        },
      });
      /* console.log('S3 응답 상태:', response.status); */
      /* console.log('S3 응답 헤더:', [...response.headers.entries()]); */
      if (!response.ok) {
        const errorText = await response.text();
        /* console.error('S3 업로드 에러 응답:', errorText); */
        throw new Error(`S3 업로드 실패: ${response.status} - ${errorText}`);
      }
      /* console.log('S3 업로드 성공'); */
      return true;
    } catch (error) {
      /* console.error('S3 업로드 실패:', error); */
      throw error;
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = async (file) => {
    if (!isHost) {
      showToast('error', '방장만 배경을 업로드할 수 있습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    const validation = validateFile(file);
    if (!validation.isValid) {
      showToast('error', validation.error, {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1단계: Presigned URL 요청
      // showToast('info', '업로드 준비 중...', {
      //   duration: 1000,
      //   position: 'top-center',
      // });
      setUploadProgress(25);

      const presignedUrl = await getPresignedBackgroundUploadUrl(roomCode);
      setUploadProgress(50);

      // 2단계: S3에 파일 업로드
      // showToast('info', '파일 업로드 중...', {
      //   duration: 2000,
      //   position: 'top-center',
      // });

      await uploadFileToS3(file, presignedUrl);
      setUploadProgress(75);

      // 3단계: 배경 변경 요청
      // showToast('info', '배경 적용 중...', {
      //   duration: 1000,
      //   position: 'top-center',
      // });

      await changeBackground(roomCode, -1, clientId);
      setUploadProgress(100);

      // 성공 처리
      // showToast('success', '커스텀 배경이 성공적으로 적용되었습니다!', {
      //   duration: 3000,
      //   position: 'top-center',
      // });

      // 부모 컴포넌트에 성공 알림
      if (onUploadSuccess) {
        onUploadSuccess({
          id: 'custom-uploaded',
          name: file.name,
          type: 'background',
          isCustom: true,
        });
      }

      // 성공 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      /* console.error('배경 업로드 실패:', error); */
      showToast('error', `업로드 실패: ${error.message}`, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 전체 창에 대한 드래그 이벤트 처리
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev - 1);
    if (dragCounter <= 1) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
    e.target.value = '';
  };

  const handleFileButtonClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isUploading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={handleBackdropClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 파일 입력 (숨김) */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 모달 컨텐츠 */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              color: '#1f2937',
            }}
          >
            🎨 커스텀 배경 업로드
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isUploading ? 0.5 : 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* 권한 체크 */}
        {!isHost && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚫</div>
            <div style={{ color: '#dc2626', fontWeight: '500' }}>
              방장만 배경을 업로드할 수 있습니다
            </div>
          </div>
        )}

        {/* 드래그 앤 드롭 영역 */}
        <div
          style={{
            border: `3px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: isDragging
              ? '#eff6ff'
              : isUploading || !isHost
                ? '#f9fafb'
                : '#ffffff',
            transition: 'all 0.3s ease',
            cursor: isUploading || !isHost ? 'not-allowed' : 'pointer',
            opacity: isUploading || !isHost ? 0.7 : 1,
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            position: 'relative',
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={isHost && !isUploading ? handleFileButtonClick : undefined}
        >
          {isUploading ? (
            // 업로드 진행 상태
            <>
              <div style={{ fontSize: '48px' }}>⏳</div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                업로드 중... {Math.round(uploadProgress)}%
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#3b82f6',
                    height: '100%',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease',
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                잠시만 기다려주세요...
              </div>
            </>
          ) : (
            // 기본 상태
            <>
              <div style={{ fontSize: '64px' }}>{isDragging ? '📥' : '📁'}</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  {isDragging
                    ? '파일을 여기에 놓으세요!'
                    : isHost
                      ? '이미지를 드래그하거나 클릭해서 업로드'
                      : '업로드 권한이 없습니다'}
                </div>
                {!isDragging && isHost && (
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      textAlign: 'center',
                      lineHeight: '1.5',
                    }}
                  >
                    JPG, PNG, GIF, WebP 형식 지원
                    <br />
                    최대 파일 크기: 10MB
                  </div>
                )}
              </div>
            </>
          )}

          {/* 전체 드래그 오버레이 */}
          {isDragging && !isUploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#3b82f6',
                opacity: 0.1,
                borderRadius: '12px',
              }}
            />
          )}
        </div>

        {/* 파일 선택 버튼 */}
        {!isUploading && isHost && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={handleFileButtonClick}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow =
                  '0 6px 12px rgba(59, 130, 246, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.25)';
              }}
            >
              📁 컴퓨터에서 파일 선택
            </button>
          </div>
        )}

        {/* 안내 메시지 */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0369a1',
            textAlign: 'center',
            lineHeight: '1.5',
          }}
        >
          💡 <strong>안내:</strong> 업로드된 배경은 자동으로 방 전체에 적용되며,
          <br />
          모든 참여자가 동일한 배경을 보게 됩니다.
        </div>
      </div>
    </div>
  );
};

export default BackgroundUploadModal;
