import React, { useState } from 'react';
import { showToast } from '../Toast/toast';
import { generateAIBackground } from '../../../services/apiUtils'; // API 설정 import
import {
  getPresignedBackgroundUploadUrl,
  changeBackground,
  uploadAIBackgroundToRoom,
} from '@/services/apiUtils';
import { useRoomStore } from '../../../stores';

const AIBackgroundModal = ({ isOpen, onClose, roomCode, onUploadSuccess, isHost }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const { clientId } = useRoomStore();
  // 랜덤 프롬프트 생성용 데이터
  const places = ["숲", "우주", "도시", "바다", "산", "그랜드캐니언", "고급 자동차",
    "에펠탑", "만리장성", "사막", "폭포", "빙하", "동굴", "정글", "달", "화성", "뉴욕", "도쿄", "절벽에서"];
  const actions = ["싸우는", "춤추는", "명상하는", "노래하는", "사진찍는", "요가하는", "달리는",
    "책읽는", "하늘을 나는", "스케이트 타는", "커피 마시는", "술마시는", "식사하는", "파티하는", "고뇌하는",
    "오르는", "조난 당한"];
  const subjects = ["고양이", "사람", "개", "소방관", "외계인", "조각상", "토끼", "삐에로",
    "사슴", "유니콘", "곰", "cool Guy", "강사님", "여자 아이돌"];

  const generateRandomPrompt = () => {
    const place = places[Math.floor(Math.random() * places.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    const randomPrompt = `${place}에서 ${action} ${subject}`;
    setPrompt(randomPrompt);
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      showToast('error', '프롬프트를 입력해주세요.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setImageBlob(null);

    try {
      showToast('info', 'AI가 이미지를 생성하고 있습니다...', {
        duration: 3000,
        position: 'top-center',
      });

      // apiUtils의 generateAIBackground 함수 사용
      const blob = await generateAIBackground(prompt, 512, 512);
      setImageBlob(blob);
      
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);

      showToast('success', '이미지 생성이 완료되었습니다!', {
        duration: 2000,
        position: 'top-center',
      });

    } catch (error) {
      /* console.error('이미지 생성 실패:', error); */
      showToast('error', `이미지 생성 실패: ${error.message}`, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadImageToBackground = async () => {
    if (!isHost) {
      showToast('error', '방장만 배경을 설정할 수 있습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    if (!imageBlob) {
      showToast('error', '업로드할 이미지가 없습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    setIsUploading(true);

    try {
      showToast('info', '배경 적용 중...', {
        duration: 2000,
        position: 'top-center',
      });

      // apiUtils의 uploadAIBackgroundToRoom 함수 사용
      await uploadAIBackgroundToRoom(roomCode, imageBlob, clientId);

      // 성공 처리
      showToast('success', 'AI 생성 배경이 성공적으로 적용되었습니다!', {
        duration: 3000,
        position: 'top-center',
      });

      // 부모 컴포넌트에 성공 알림
      if (onUploadSuccess) {
        onUploadSuccess({
          id: 'ai-generated',
          name: `AI: ${prompt.substring(0, 20)}...`,
          type: 'background',
          isCustom: true,
          isAI: true,
        });
      }

      // 성공 후 모달 닫기
      setTimeout(() => {
        onClose();
        // 상태 초기화
        setPrompt('');
        setGeneratedImage(null);
        setImageBlob(null);
      }, 1500);

    } catch (error) {
      /* console.error('배경 업로드 실패:', error); */
      showToast('error', error.message, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating && !isUploading) {
      onClose();
      // 상태 초기화
      setPrompt('');
      setGeneratedImage(null);
      setImageBlob(null);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isGenerating && !isUploading) {
      handleClose();
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
    >
      {/* 모달 컨텐츠 */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: 0,
            color: '#1f2937'
          }}>
            🤖 AI 배경 생성
          </h2>
          <button
            onClick={handleClose}
            disabled={isGenerating || isUploading}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              cursor: (isGenerating || isUploading) ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (isGenerating || isUploading) ? 0.5 : 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* 프롬프트 입력 영역 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px',
          }}>
            🎨 이미지 설명 (프롬프트)
          </label>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="생성하고 싶은 배경을 설명해주세요... (예: 숲에서 춤추는 고양이)"
              disabled={isGenerating}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                backgroundColor: isGenerating ? '#f9fafb' : 'white',
                opacity: isGenerating ? 0.7 : 1,
                cursor: isGenerating ? 'not-allowed' : 'text',
              }}
              onFocus={(e) => {
                if (!isGenerating) {
                  e.target.style.borderColor = '#3b82f6';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
            <button
              onClick={generateRandomPrompt}
              disabled={isGenerating}
              style={{
                padding: '12px 16px',
                backgroundColor: isGenerating ? '#f3f4f6' : '#f3f4f6',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                transition: 'all 0.2s ease',
                opacity: isGenerating ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.target.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              🎲 랜덤
            </button>
          </div>

          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: isGenerating || !prompt.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (isGenerating || !prompt.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: (isGenerating || !prompt.trim()) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!isGenerating && prompt.trim()) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isGenerating && prompt.trim()) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isGenerating ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>🌀</span>
                AI 이미지 생성 중...
              </>
            ) : (
              <>
                ✨ 이미지 생성하기
              </>
            )}
          </button>
        </div>

        {/* 생성된 이미지 표시 영역 */}
        {generatedImage && (
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px'
            }}>
              ✨ 생성된 이미지
            </div>
            
            <img
              src={generatedImage}
              alt="AI 생성 이미지"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px',
              }}
            />

            {isHost && (
              <button
                onClick={uploadImageToBackground}
                disabled={isUploading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  opacity: isUploading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '0 auto',
                }}
                onMouseEnter={(e) => {
                  if (!isUploading) {
                    e.target.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUploading) {
                    e.target.style.backgroundColor = '#10b981';
                  }
                }}
              >
                {isUploading ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>🌀</span>
                    배경 적용 중...
                  </>
                ) : (
                  <>
                    🖼️ 배경으로 사용하기
                  </>
                )}
              </button>
            )}
          </div>
        )}


      </div>


    </div>
  );
};

export default AIBackgroundModal;