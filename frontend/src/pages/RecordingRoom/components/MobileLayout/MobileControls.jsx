/* eslint-disable */
import React from 'react';
import Button from '../../../../components/common/Button/Button';
import mobileStyles from '../../styles/mobile.module.css';
import portraitStyles from '../../styles/portrait.module.css';
import responsiveStyles from '../../styles/responsive.module.css';

const MobileControls = ({
  isRecording,
  isCountingDown,
  onTakePhoto,
  onStartRecording,
  onStopRecording,
  onShowHelp,
  onMenuToggle,
  isPortrait = false,
}) => {
  // 버튼 비활성화 조건
  const isDisabled = isCountingDown;
  const isPhotoDisabled = isDisabled || isRecording;
  const isVideoDisabled = isDisabled;

  const controlsClass = `${mobileStyles.controlsContainer} ${
    isPortrait ? portraitStyles.portraitControls : ''
  } ${responsiveStyles.horizontalScroll}`;

  const getButtonClass = (baseClass = '') => {
    return `${mobileStyles.mobileButton} ${
      isPortrait ? portraitStyles.portraitButton : ''
    } ${responsiveStyles.touchTarget} ${baseClass}`;
  };

  return (
    <div className={controlsClass}>
      {/* 모든 버튼을 한 줄에 배치 */}
      <div className="flex gap-2 w-full justify-center items-center">
        {/* 햄버거 메뉴 버튼 */}
        <Button
          variant={Button.Variants.OUTLINE}
          onClick={onMenuToggle}
          disabled={isDisabled}
          className={getButtonClass('min-w-[44px] aspect-square')}
          title="필터 메뉴"
        >
          <span className="text-xl font-bold">≡</span>
        </Button>

        {/* 사진 촬영 버튼 */}
        <Button
          variant={Button.Variants.PRIMARY}
          onClick={onTakePhoto}
          disabled={isPhotoDisabled}
          className={getButtonClass(
            `flex-1 ${isCountingDown ? 'animate-pulse opacity-50' : ''} ${
              isRecording ? 'opacity-50 cursor-not-allowed' : ''
            }`
          )}
        >
          <span className="flex items-center gap-1 text-sm font-semibold">
            사진
          </span>
        </Button>

        {/* 영상 녹화 버튼 */}
        {!isRecording ? (
          <Button
            variant={Button.Variants.SUCCESS}
            onClick={onStartRecording}
            disabled={isVideoDisabled}
            className={getButtonClass(
              `flex-1 ${isCountingDown ? 'animate-pulse opacity-50' : ''}`
            )}
          >
            <span className="flex items-center gap-1 text-sm font-semibold">
              영상
            </span>
          </Button>
        ) : (
          <Button
            variant={Button.Variants.DANGER}
            onClick={onStopRecording}
            disabled={isCountingDown}
            className={getButtonClass(
              `flex-1 ${isCountingDown ? 'opacity-50' : 'animate-pulse'}`
            )}
          >
            <span className="flex items-center gap-1 text-sm font-semibold">
              🛑 완료
            </span>
          </Button>
        )}

        {/* 도움말 버튼 */}
        <Button
          variant={Button.Variants.OUTLINE}
          onClick={onShowHelp}
          disabled={isDisabled}
          className={getButtonClass('min-w-[44px] aspect-square')}
          title="사용법 안내"
        >
          <span className="text-xl font-bold">?</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileControls;