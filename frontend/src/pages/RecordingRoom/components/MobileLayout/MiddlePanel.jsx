/* eslint-disable */
import React from 'react';
import RoomInfo from '../../../../components/Room/RoomInfo/RoomInfo';
import ParticipantList from '../../../../components/Room/ParticipantList/ParticipantList';
import mobileStyles from '../../styles/mobile.module.css';
import portraitStyles from '../../styles/portrait.module.css';

const MiddlePanel = ({ isPortrait = false }) => {
  return (
    <div className={`${mobileStyles.middlePanel} ${
      isPortrait ? portraitStyles.portraitMiddlePanel : ''
    }`}>
      <div className={mobileStyles.middlePanelContent}>
        {/* 룸 정보 섹션 */}
        <div className="mb-4">
          <RoomInfo />
        </div>
        
        {/* 참가자 목록 섹션 */}
        <div className="flex-1">
          <ParticipantList />
        </div>
      </div>
    </div>
  );
};

export default MiddlePanel;