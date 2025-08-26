/* eslint-disable */
import React, { useState } from 'react';
import useViewport from '../../../../hooks/useViewport';
import MobileControls from './MobileControls';
import MiddlePanel from './MiddlePanel';
import RecordingCanvas from '../../../../components/Recording/RecordingCanvas/RecordingCanvas';
import SideMenu from '../../../../components/common/SideMenu/SideMenu';
import mobileStyles from '../../styles/mobile.module.css';
import portraitStyles from '../../styles/portrait.module.css';

const MobileLayout = ({
  // Props from RecordingRoom
  recordingCanvasRef,
  handleTakePhoto,
  handleStartRecording,
  handleStopRecording,
  setShowHelpModal,
  showHelpModal,
  isRecording,
  isCountingDown,
  // Additional props for mobile UI
  onMenuToggle,
  showSideMenu,
  activeMenu,
  setActiveMenu,
}) => {
  const { isPortrait } = useViewport();

  const containerClass = `${mobileStyles.mobileContainer} ${
    isPortrait ? portraitStyles.portraitLayout : ''
  }`;

  const handleHelpToggle = () => {
    setShowHelpModal(!showHelpModal);
  };

  return (
    <div className={containerClass}>

      {/* 캔버스 영역 */}
      <main className={mobileStyles.canvasArea}>
        <div
          className={`${mobileStyles.canvasWrapper} ${
            isPortrait ? portraitStyles.portraitCanvas : ''
          }`}
        >
          <RecordingCanvas ref={recordingCanvasRef} />
        </div>
      </main>


      {/* 참가자 목록 패널 (RecordingCanvas와 MobileControls 사이) */}
      <MiddlePanel isPortrait={isPortrait} />

      {/* 컨트롤 영역 */}
      <div className={mobileStyles.controlsArea}>
        <MobileControls
          isRecording={isRecording}
          isCountingDown={isCountingDown}
          onTakePhoto={handleTakePhoto}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onShowHelp={handleHelpToggle}
          onMenuToggle={onMenuToggle}
          isPortrait={isPortrait}
        />
      </div>



      {/* 모바일 사이드 메뉴 (오버레이) */}
      {showSideMenu && (
        <div className="fixed inset-0 z-[2000] md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onMenuToggle}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
            <SideMenu
              onMenuSelect={setActiveMenu}
              activeMenu={activeMenu || 'filter'}
              isMobile={true}
              onClose={onMenuToggle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
