/* eslint-disable */
import React from 'react';
import styles from './EnterRoomButton.module.css';
import Button from '../../../../components/common/Button/Button';
import useUserStore from '../../../../stores/userStore';

const EnterRoomButton = ({ onEnterRoom, isEntering }) => {
  const { isReadyForServer } = useUserStore();
  
  // 준비 상태 체크 (카메라 off 상태에서도 입장 가능하도록 수정)
  const readyStatus = isReadyForServer();
  const isReady = readyStatus.isValid;

  return (
    <div className={styles.buttonContainer}>
      {/* 입장 버튼 */}
      <Button
        variant={isReady ? 'primary' : 'secondary'}
        size='large'
        onClick={onEnterRoom}
        disabled={!isReady || isEntering}
        className={styles.enterButton}
      >
        {isEntering ? (
          <>
            <span className={styles.loadingSpinner}></span>
            입장 중...
          </>
        ) : isReady ? (
          '방에 입장하기'
        ) : (
          '준비 중...'
        )}
      </Button>

      {isReady && (
        <p className={styles.helpText}>
          모든 설정이 완료되었습니다!<br />
          방에 입장하여 촬영을 시작하세요.
        </p>
      )}
    </div>
  );
};

export default EnterRoomButton;