/* eslint-disable */
import React from 'react';
import styles from './MediaSelectorVertical.module.css';
import {
  VIDEO_FILTERS,
  applyEffectsToCanvas,
} from '../../../utils/videoFilters';

/**
 * 세로 스크롤 방식의 미디어 선택 컴포넌트 (프레임/필터/배경 등)
 * 선택 시 즉시 적용되는 방식으로 변경
 *
 * @param {string} type - 선택기 타입 ('frame', 'filter', 'background')
 * @param {boolean} isOpen - 열림/닫힘 상태
 * @param {function} onClose - 닫기 핸들러
 * @param {Array} items - 선택 가능한 아이템들
 * @param {Object} selectedItem - 현재 선택된 아이템
 * @param {function} onSelectItem - 아이템 선택 핸들러 (즉시 적용)
 * @param {string} title - 헤더 타이틀 (옵션)
 * @param {boolean} isHost - 호스트 여부
 * @param {boolean} showApplyButton - 적용 버튼 표시 여부 (배경만 true)
 * @param {function} onApply - 배경 적용 핸들러
 * @param {function} showToast - 토스트 알림 함수
 * @param {React.Component} customUploadComponent - 커스텀 업로드 컴포넌트 (새로 추가)
 */
const MediaSelectorVertical = ({
  type = 'frame',
  isOpen = false,
  onClose = () => {},
  items = [],
  selectedItem = null,
  onSelectItem = () => {},
  title = '',
  isHost = false,
  showApplyButton = false, // 배경만 적용 버튼 표시
  onApply = () => {}, // 배경 적용 핸들러
  showToast = () => {}, // 토스트 알림 함수
  customUploadComponent = null, // 커스텀 업로드 컴포넌트
}) => {

  const currentItems =
    items.length > 0
      ? items
      : type === 'filter'
        ? VIDEO_FILTERS
        : type === 'background';

  const currentTitle =
    title ||
    (type === 'filter'
      ? '필터 선택'
      : type === 'frame'
        ? '프레임 선택'
        : type === 'overlay'
          ? '오버레이 선택'
          : '배경 선택');


  // ✅ 아이템 선택 시 즉시 적용 (필터, 프레임만)
  const handleItemSelect = (item) => {
    // /* console.log(`🎨 ${type} 즉시 적용:`, item.name); */

    // 즉시 적용 (필터, 프레임만)
    if (type === 'filter' || type === 'frame' || type==='overlay') {
      onSelectItem(item);
    }
    // 배경은 선택만 하고 적용 버튼으로 확정
    else if (type === 'background') {
      onSelectItem(item);
    }
  };

  // ✅ 배경 적용 버튼 클릭 핸들러 (호스트 권한 체크)
  const handleBackgroundApply = () => {
    // 호스트 권한 체크
    if (type === 'background' && !isHost) {
      showToast('error', '방장만 배경을 변경할 수 있습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    // 선택된 아이템이 없는 경우
    if (!selectedItem || selectedItem.id === 'none') {
      showToast('error', '변경할 배경을 선택해주세요.', {
        duration: 1500,
        position: 'top-center',
      });
      return;
    }

    // 커스텀 업로드 타입인 경우 적용 버튼 비활성화
    if (selectedItem.type === 'upload') {
      showToast('info', '위의 업로드 영역을 사용해 이미지를 업로드해주세요.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    // 배경 적용 실행
    // /* console.log('🎨 배경 적용:', selectedItem); */
    onApply(selectedItem);
    onClose();
  };

  if (!isOpen) return null;

  // 커스텀 업로드 모드인지 확인
  const isUploadMode = type === 'background' && selectedItem?.type === 'upload';

  // ✅ 개선된 URL 판별 함수 - 배경과 오버레이 모두 지원
  const isUrl = (preview) => {
    return typeof preview === 'string' && 
           (preview.startsWith('http://') || preview.startsWith('https://'));
  };

  // ✅ 이미지 렌더링이 필요한 타입인지 확인
  const shouldRenderImage = (item, type) => {
    return item&&(type === 'background' || type === 'overlay') &&
           item.preview &&
           item.preview !== '🚫' &&
           item.preview !== '📁' &&
           item.type !== 'none' &&
           item.type !== 'upload' &&
           isUrl(item.preview);
  };

  return (
    <div className={styles.container}>
      {/* 현재 선택된 아이템 정보 */}
      <div className={styles.selectedSection}>
        <div className={styles.selectedInfo}>
          <div className={styles.selectedPreview}>
            {shouldRenderImage(selectedItem, type) ? (
              <img
                src={selectedItem.preview}
                alt={selectedItem.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 'inherit',
                }}
                onError={(e) => {
                  // 이미지 로드 실패 시 대체 텍스트 표시
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              selectedItem?.preview || '🎨'
            )}
            {/* 이미지 로드 실패 시 표시될 fallback */}
            {shouldRenderImage(selectedItem, type) && (
              <div
                style={{
                  display: 'none',
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                🖼️
              </div>
            )}
          </div>
          <div className={styles.selectedDetails}>
            <h4>{selectedItem?.name || '선택된 항목 없음'}</h4>
            <p>
              {selectedItem?.type === 'upload'
                ? '아래에서 이미지를 업로드해주세요'
                : type === 'filter'
                  ? selectedItem?.description
                  : type === 'frame'
                    ? selectedItem?.description
                    : type === 'overlay'
                      ? selectedItem?.description
                      : '배경 이미지'}
            </p>
            {/* ✅ 배경 타입이고 호스트가 아닌 경우 권한 안내 */}
            {type === 'background' && !isHost && (
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-error)',
                  marginTop: '0.25rem',
                }}
              >
                ⚠️ 방장만 배경을 변경할 수 있습니다
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 커스텀 업로드 컴포넌트 (업로드 모드일 때만 표시) */}
      {isUploadMode && customUploadComponent && (
        <div className={styles.uploadSection}>{customUploadComponent}</div>
      )}

      {/* 아이템 목록 (세로 스크롤) */}
      <div className={styles.itemsContainer}>
        {currentItems.map((item) => {
          const isSelected = selectedItem?.id === item.id;

          return (
            <div
              key={item.id}
              className={`${styles.item} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleItemSelect(item)}
            >
              <div className={styles.itemPreview}>
                {shouldRenderImage(item, type) ? (
                  <>
                    <img
                      src={item.preview}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 'inherit',
                      }}
                      onError={(e) => {
                        // 이미지 로드 실패 시 대체 텍스트 표시
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    {/* 이미지 로드 실패 시 표시될 fallback */}
                    <div
                      style={{
                        display: 'none',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: 'var(--color-text-secondary)',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                    >
                      🕶️
                    </div>
                  </>
                ) : (
                  item.preview
                )}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemDesc}>
                  {getItemDescription(item, type)}
                </div>
              </div>
              {isSelected && <div className={styles.checkmark}>✓</div>}
            </div>
          );
        })}
      </div>

      {/* 필터일 경우 완료 버튼 */}
      {type === 'filter' && (
        <div className={styles.footer}>
          <button
            className={`${styles.button} ${styles.primary} w-full`}
            onClick={onClose}
          >
            완료
          </button>
        </div>
      )}

      {/* ✅ 배경 타입일 때만 적용 버튼 표시 */}
      {showApplyButton && type === 'background' && (
        <div className={styles.footer}>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={onClose}
            >
              취소
            </button>
            <button
              className={`${styles.button} ${styles.primary} ${
                !isHost ||
                !selectedItem ||
                selectedItem.id === 'none' ||
                selectedItem.type === 'upload'
                  ? styles.disabled
                  : ''
              }`}
              onClick={handleBackgroundApply}
              disabled={
                !selectedItem ||
                selectedItem.id === 'none' ||
                selectedItem.type === 'upload'
              }
              style={{
                opacity: !isHost || selectedItem?.type === 'upload' ? 0.6 : 1,
                cursor:
                  !isHost || selectedItem?.type === 'upload'
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {!isHost
                ? '방장 전용'
                : selectedItem?.type === 'upload'
                  ? '업로드 필요'
                  : '적용'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 아이템별 설명 텍스트 생성 함수
const getItemDescription = (item, type) => {
  if (item.type === 'none') return '기본 설정';
  if (item.type === 'upload') return '사용자 정의';

  switch (type) {
    case 'filter':
      const filterDescs = {
        sepia: '따뜻한 갈색 톤',
        grayscale: '흑백 효과',
        vintage: '레트로 감성',
        warm: '따뜻한 색감',
        cool: '차가운 색감',
        dramatic: '명암 강화',
        soft: '부드러운 느낌',
        sharp: '선명한 대비',
        dream: '몽환적 분위기',
      };
      return filterDescs[item.id] || '특수 효과';

    case 'background':
      const bgDescs = {
        solid: '단색 배경',
        gradient: '그라데이션 효과',
        space: '우주 테마',
        beach: '해변 풍경',
        city: '도시 야경',
        forest: '자연 풍경',
        mountain: '산악 풍경',
        ocean: '바다 풍경',
        custom: '사용자 정의',
      };
      return bgDescs[item.id] || '테마 배경';

    case 'frame':
      const frameDescs = {
        polaroid: '즉석 사진 스타일',
        heart: '하트 모양 테두리',
        vintage: 'VHS 테이프 느낌',
        neon: '네온사인 효과',
        retro: '8비트 게임 스타일',
        star: '별 모양 장식',
        flower: '꽃 테두리',
        rainbow: '무지개 효과',
        fire: '불꽃 테두리',
      };
      return frameDescs[item.id] || '장식 프레임';

    case 'overlay':
      return item.description || '오버레이 효과';
      
    default:
      return '효과 적용';
  }
};

export default MediaSelectorVertical;