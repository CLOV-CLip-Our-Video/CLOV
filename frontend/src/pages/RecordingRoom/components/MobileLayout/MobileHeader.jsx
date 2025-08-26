import React from 'react';
import { useRoomStore } from '../../../../stores';
import useUserStore from '../../../../stores/userStore';
import useCanvasParticipantsStore from '../../../../stores/canvasParticipantsStore';
import mobileStyles from '../../styles/mobile.module.css';
import portraitStyles from '../../styles/portrait.module.css';

const MobileHeader = ({ 
  onMenuToggle, 
  showSideMenu, 
  onSettingsToggle, 
  isBottomSheetExpanded,
  isPortrait = false 
}) => {
  const { roomCode } = useRoomStore();
  const { nickname } = useUserStore();
  const { participantsState } = useCanvasParticipantsStore();
  
  // 참가자 수 계산 (자신 포함)
  const participantCount = Object.keys(participantsState).length;

  const headerClass = `${mobileStyles.mobileHeader} ${
    isPortrait ? portraitStyles.portraitHeader : ''
  }`;

  const roomCodeClass = `${mobileStyles.roomCode} ${
    isPortrait ? portraitStyles.portraitRoomCode : ''
  }`;

  return (
    <header className={headerClass}>
      {/* 왼쪽 영역: 햄버거 메뉴 + 방 정보 */}
      <div className={mobileStyles.headerLeft}>
        <button
          className={mobileStyles.menuButton}
          onClick={onMenuToggle}
          aria-label="메뉴 열기"
          type="button"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        
        <div className="flex flex-col">
          <span className={roomCodeClass}>
            {roomCode}
          </span>
          {nickname && (
            <span className="text-xs text-gray-500 truncate max-w-20">
              {nickname}
            </span>
          )}
        </div>
      </div>

      {/* 오른쪽 영역: 참가자 수 + 설정 버튼 */}
      <div className={mobileStyles.headerRight}>
        {/* 참가자 수 표시 */}
        <div className={mobileStyles.participantCount}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          {participantCount}
        </div>

        {/* 설정 토글 버튼 */}
        <button
          className={mobileStyles.menuButton}
          onClick={onSettingsToggle}
          aria-label={isBottomSheetExpanded ? '설정 패널 닫기' : '설정 패널 열기'}
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isBottomSheetExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;