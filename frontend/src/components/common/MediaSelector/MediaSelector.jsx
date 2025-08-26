/* eslint-disable */
import React, { useState } from 'react';
import styles from './MediaSelector.module.css';
import SliderBar from '../../common/SliderBar/SliderBar';

/**
 * 범용 미디어 선택 컴포넌트 (프레임/필터/배경 등)
 *
 * @param {string} type - 선택기 타입 ('frame', 'filter', 'background')
 * @param {boolean} isOpen - 열림/닫힘 상태
 * @param {function} onClose - 닫기 핸들러
 * @param {Array} items - 선택 가능한 아이템들
 * @param {Object} selectedItem - 현재 선택된 아이템
 * @param {function} onSelectItem - 아이템 선택 핸들러
 * @param {boolean} showIntensitySlider - 강도 조절 슬라이더 표시 여부
 * @param {number} intensity - 강도 값 (0-100)
 * @param {function} onIntensityChange - 강도 변경 핸들러
 * @param {string} title - 헤더 타이틀 (옵션)
 */
const MediaSelector = ({
  type = 'frame',
  isOpen = false,
  onClose = () => {},
  items = [],
  selectedItem = null,
  onSelectItem = () => {},
  showIntensitySlider = false,
  intensity = 100,
  onIntensityChange = () => {},
  title = '',
}) => {
  // 더미 데이터 (테스트용)
  const dummyFrames = [
    { id: 'none', name: '없음', preview: null, type: 'none' },
    { id: 'polaroid', name: '폴라로이드', preview: '📷', type: 'frame' },
    { id: 'heart', name: '하트', preview: '💖', type: 'frame' },
    { id: 'vintage', name: '빈티지', preview: '📼', type: 'frame' },
    { id: 'neon', name: '네온', preview: '⚡', type: 'frame' },
    { id: 'retro', name: '레트로', preview: '🎮', type: 'frame' },
  ];

  const dummyFilters = [
    { id: 'none', name: '원본', preview: '🎨', type: 'none' },
    { id: 'sepia', name: '세피아', preview: '🟤', type: 'filter' },
    { id: 'grayscale', name: '흑백', preview: '⚫', type: 'filter' },
    { id: 'vintage', name: '빈티지', preview: '📸', type: 'filter' },
    { id: 'warm', name: '따뜻함', preview: '🔥', type: 'filter' },
    { id: 'cool', name: '차가움', preview: '❄️', type: 'filter' },
    { id: 'dramatic', name: '드라마틱', preview: '🎭', type: 'filter' },
  ];

  const currentItems =
    items.length > 0 ? items : type === 'filter' ? dummyFilters : dummyFrames;
  const currentTitle =
    title ||
    (type === 'filter'
      ? '필터 선택'
      : type === 'frame'
        ? '프레임 선택'
        : '배경 선택');

  if (!isOpen) return null;

  return (
    <>
      {/* 메인 컨테이너 */}
      <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
        {/* 헤더 */}
        <div
          className='flex items-center justify-between p-4 border-b'
          style={{ borderColor: 'var(--border-color-default)' }}
        >
          <h3
            className='text-lg font-semibold m-0'
            style={{ color: 'var(--color-text)' }}
          >
            {currentTitle}
          </h3>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer transition-colors ${styles.closeButton}`}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className='flex-1 overflow-hidden'>
          {/* 현재 선택된 아이템 + 슬라이더 */}
          <div
            className='p-4 border-b'
            style={{ borderColor: 'var(--border-color-default)' }}
          >
            <div className='flex items-center gap-4 mb-3'>
              <div
                className={`${styles.selectedPreview} flex items-center justify-center text-2xl`}
              >
                {selectedItem?.preview || '🎨'}
              </div>
              <div>
                <h4
                  className='text-sm font-medium m-0'
                  style={{ color: 'var(--color-text)' }}
                >
                  {selectedItem?.name || '선택된 항목 없음'}
                </h4>
                <p
                  className='text-xs m-0 mt-1'
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {type === 'filter'
                    ? '필터 효과'
                    : type === 'frame'
                      ? '프레임 스타일'
                      : '배경 이미지'}
                </p>
              </div>
            </div>

            {/* 강도 조절 슬라이더 */}
            {showIntensitySlider && selectedItem?.id !== 'none' && (
              <SliderBar
                min={0}
                max={100}
                value={intensity}
                onChange={(e) => onIntensityChange(e.target.value)}
                label='강도'
                unit='%'
              />
            )}
          </div>

          {/* 아이템 목록 (스크롤 가능) */}
          <div className='p-4'>
            <div
              className={`${styles.itemGrid} flex gap-3 overflow-x-auto pb-2`}
            >
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.item} ${selectedItem?.id === item.id ? styles.selected : ''}
                             flex-shrink-0 cursor-pointer`}
                  onClick={() => onSelectItem(item)}
                >
                  <div className='flex items-center justify-center text-xl mb-2 h-12'>
                    {item.preview}
                  </div>
                  <span
                    className='text-xs text-center block'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼들 */}
        <div
          className='p-4 border-t'
          style={{ borderColor: 'var(--border-color-default)' }}
        >
          <div className='flex gap-2'>
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium cursor-pointer ${styles.cancelButton}`}
              onClick={onClose}
            >
              취소
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg border-none text-sm font-medium cursor-pointer ${styles.applyButton}`}
              onClick={onClose}
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediaSelector;
