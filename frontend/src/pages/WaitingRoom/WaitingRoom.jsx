/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './WaitingRoom.module.css';

// Components
import VideoPreview from './components/VideoPreview/VideoPreview';
import UserInfoCard from './components/UserInfoCard/UserInfoCard';
import SegmentationModeSelector from './components/SegmentationModeSelector/SegmentationModeSelector';
import FilterSelector from './components/FilterSelector/FilterSelector';
import OpacitySettings from './components/OpacitySettings/OpacitySettings';
import EnterRoomButton from './components/EnterRoomButton/EnterRoomButton';
import NicknameModal from './components/NicknameModal/NicknameModal';

// Hooks & Stores
import useUserStore from '../../stores/userStore';
import useRoomStore from '../../stores/roomStore';
import useRoomEntry from './hooks/useRoomEntry';

import useCamera from '../../hooks/useCamera';
import PermissionPrompt from '../../components/Room/PermissionPrompt/PermissionPrompt';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const roomCode = useRoomStore((state) => state.roomCode);
  const setRoomCodeState = useRoomStore((s) => s.setRoomCode);
  const { isNicknameSet } = useUserStore();
  const { isEntering, handleEnterRoom } = useRoomEntry();

  // Refs
  const videoPreviewRef = useRef(null);

  // Local State
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  // 권한 상태 훅
  const camera = useCamera({ autoStart: false, defaultMicOn: false });

  // 닉네임 모달 자동 표시
  useEffect(() => {
    if (!isNicknameSet) {
      setShowNicknameModal(true);
    }
  }, [isNicknameSet]);

  // 룸코드 설정 (세션에서 복원)
  useEffect(() => {
    const savedRoomCode = sessionStorage.getItem('roomCode');
    const entryType = sessionStorage.getItem('entryType');

    // entryType이나 roomCode 없으면 강제 홈 이동
    if (!entryType || (entryType === 'join' && !savedRoomCode)) {
      navigate('/', { replace: true });
      return;
    }

    if (entryType === 'join' && savedRoomCode) {
      setRoomCodeState(savedRoomCode);
    }
  }, [navigate, setRoomCodeState]);

  const handleBackClick = () => {
    navigate('/');
  };

  // useEffect(() => {
  //   const { roomId } = useParams();
  //   const entryType = sessionStorage.getItem('entryType');

  //   // 직접 접근 차단
  //   if (!entryType) {
  //     showToast('warning', '올바른 경로로 접근해주세요.');
  //     navigate('/');
  //     return;
  //   }

  //   // roomId와 상태 동기화
  //   if (roomId && roomId !== 'create') {
  //     setRoomCodeState(roomId);
  //   }
  // }, []);

  const { roomId } = useParams(); // URL에서 roomId 가져오기

  useEffect(() => {
    if (roomId && roomId !== 'createroom') {
      // URL의 roomId를 store에 설정
      setRoomCodeState(roomId);
    }
  }, [roomId, setRoomCodeState]);

  return (
    <div className={styles.container}>
      {/* 상단 네비게이션 */}
      <div className={styles.topNav}>
        <button
          className={styles.backButton}
          onClick={handleBackClick}
          aria-label='메인 페이지로 돌아가기'
        >
          ← 돌아가기
        </button>
        <div className={styles.roomCodeDisplay}>
          방 코드: {roomCode || '???'}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className={styles.content}>
        {/* 왼쪽: 비디오 프리뷰 */}
        <section className={styles.videoSection}>
          <VideoPreview
            ref={videoPreviewRef}
            className={styles.cameraPreview}
          />
        </section>

        {/* 오른쪽: 컴팩트 설정 패널 */}
        <aside className={styles.settingsPanel}>
          <UserInfoCard onEditClick={() => setShowNicknameModal(true)} />
          <SegmentationModeSelector />
          <FilterSelector />
          <OpacitySettings />
          <EnterRoomButton
            onEnterRoom={handleEnterRoom}
            isEntering={isEntering}
          />
        </aside>
      </main>

      {/* 닉네임 설정 모달 */}
      <NicknameModal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
      />

      {/* 권한 안내 오버레이 */}
      <PermissionPrompt
        state={camera.permissions.state}
        loading={camera.permissions.loading}
        onRequest={camera.permissions.requestBoth}
        platformHelp={camera.permissions.platformHelp}
        onRefresh={camera.permissions.refresh}
      />
    </div>
  );
};

export default WaitingRoom;
