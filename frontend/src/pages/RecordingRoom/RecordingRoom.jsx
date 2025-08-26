/* eslint-disable */
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useRecordingStore, useRoomStore } from '../../stores';
import { RecordingControls, SaveModal, HelpModal } from './components';
import RoomInfo from '../../components/Room/RoomInfo/RoomInfo';
import ParticipantList from '../../components/Room/ParticipantList/ParticipantList';
import SideMenu from '../../components/common/SideMenu/SideMenu';
import RecordingCanvas from '../../components/Recording/RecordingCanvas/RecordingCanvas';
import useUserStore from '../../stores/userStore';
import {
  connectWebSocket,
  closeSocket,
  isSocketOpen,
  sendEvent,
} from '../../services/socket';
import useSocketEvents from '../../hooks/useSocketEvents';
import { safelyLeaveRoom } from '../../utils/safelyLeaveRoom';
import { useBeforeUnloadGuard } from '../../hooks/useBeforeUnloadGuard';
import { useNavigationPrompt } from '../../hooks/useNavigationPrompt';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import { useNavigationPromptWithModal } from '../../hooks/useNavigationPromptWithModal';
import { showToast } from '../../components/common/Toast/toast.js';
import useViewport from '../../hooks/useViewport';
import MobileLayout from './components/MobileLayout/MobileLayout';

// import useCamera from '../../hooks/useCamera.js';
// import PermissionPrompt from '../../components/Room/PermissionPrompt/PermissionPrompt.jsx';

const RecordingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMenu, setActiveMenu] = useState(null);

  // const camera = useCamera({ autoStart: false, defaultMicOn: false });

  // 반응형 뷰포트 감지
  const { isMobile } = useViewport();

  // 모바일 전용 상태
  const [showMobileSideMenu, setShowMobileSideMenu] = useState(false);

  // RecordingCanvas ref 추가
  const recordingCanvasRef = useRef(null);

  // 촬영된 미디어 상태 (SaveModal에 전달용)
  const [capturedMedia, setCapturedMedia] = useState(null);

  // 모달 타입 구분 플래그
  const [modalType, setModalType] = useState(null); // 'photo' | 'video' | null

  // 도움말 모달 상태
  const [showHelpModal, setShowHelpModal] = useState(false);

  const clientId = useRoomStore((state) => state.clientId);
  const nickname = useUserStore((state) => state.nickname);
  const isHost = useRoomStore((state) => state.isHost);
  const [showHostLeftModal, setShowHostLeftModal] = useState(false);

  // url 직접 접근 방지
  const [accessChecked, setAccessChecked] = useState(false);

  const {
    isModalOpen,
    handleConfirm: rawConfirm,
    handleCancel,
  } = useNavigationPromptWithModal(true);

  const handleConfirm = async () => {
    await safelyLeaveRoom();
    navigate('/');
    rawConfirm();
  };

  useBeforeUnloadGuard(true);

  // RecordingStore에서 상태 가져오기
  const {
    isRecording,
    isCountingDown,
    recordedVideo,
    serverVideoUrl,
    isUploading,
    uploadError,
    resetRecording,
  } = useRecordingStore();

  const { setRoomCode } = useRoomStore();

  const [showRoomExpiredModal, setShowRoomExpiredModal] = useState(false);

  // 컴포넌트 마운트 시 roomCode 설정
  useEffect(() => {
    if (roomId) {
      setRoomCode(roomId);
    }
  }, [roomId, setRoomCode]);

  // 이거 useEffect 다른 애들보다 먼저 실행되도록 해야해 !!!!!!!!!!!!!!!!!!!!
  useEffect(() => {
    const checkRoomAccess = async () => {
      /* console.log('🔍 [ACCESS CHECK] 검증 시작'); */
      const clientId = useRoomStore.getState().clientId;
      const nickname = useUserStore.getState().nickname;
      const roomCode = useRoomStore.getState().roomCode;
      const hasValidSession = sessionStorage.getItem('validRoomEntry');

      // 초기값: 접근 불가 상태로 시작
      setAccessChecked(false);

      // 1차: 기본 정보 검증
      if (
        // !clientId ||
        !nickname ||
        !roomCode ||
        roomCode !== roomId ||
        !hasValidSession
      ) {
        /* console.warn('🚫 [ACCESS CHECK] 기본 정보 누락 → 대기실 이동'); */

        sessionStorage.setItem('entryType', 'join');
        sessionStorage.setItem('roomCode', roomId);
        navigate(`/waiting/${roomId}`, { replace: true });
        return;
      }

      // 2차: 세션 플래그 검증
      if (!hasValidSession) {
        /* console.warn('🚫 [ACCESS CHECK] 세션 플래그 없음 → 대기실 이동'); */
        showToast('info', '대기실을 통해 입장해주세요.', {
          duration: 2000,
          position: 'top-center',
        });
        navigate(`/waiting/${roomId}`, { replace: true });
        return;
      }

      // 3차: 소켓 연결 상태 검증
      if (!isSocketOpen()) {
        /* console.warn('🚫 [ACCESS CHECK] 소켓 연결 끊김 → 대기실 이동'); */
        showToast('warning', '연결이 끊어져 대기실로 이동합니다.', {
          duration: 2000,
          position: 'top-center',
        });
        navigate(`/waiting/${roomId}`, { replace: true });
        return;
      }

      // ✅ 검증 통과
      /* console.log('✅ [ACCESS CHECK] 검증 통과'); */
      setAccessChecked(true);
    };

    checkRoomAccess();
  }, [roomId, navigate]);

  // URL 파라미터로 저장 모달 상태 관리
  const showSaveModal = searchParams.get('showSave') === 'true';

  // 사진 촬영 핸들러
  const handleTakePhoto = async () => {
    if (!recordingCanvasRef.current) {
      showToast('error', '캔버스를 찾을 수 없습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    if (isCountingDown || isRecording) {
      showToast('warning', '촬영 중에는 다른 작업을 할 수 없습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    try {
      // /* console.log('📸 사진 촬영 시작...'); */

      // 캔버스에서 사진 촬영 (3초 카운트다운 포함)
      const photoData = await recordingCanvasRef.current.capturePhoto();

      // /* console.log('✅ 사진 촬영 완료:', photoData); */

      // 촬영된 미디어 설정
      setCapturedMedia(photoData);
      setModalType('photo');

      // 저장 모달 열기
      setSearchParams({ showSave: 'true' });

      showToast('success', '📸 사진이 촬영되었습니다!', {
        duration: 2000,
        position: 'top-center',
      });
    } catch (error) {
      /* console.error('❌ 사진 촬영 실패:', error); */
      showToast('error', `사진 촬영 실패: ${error.message}`, {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  // 영상 녹화 시작 핸들러
  const handleStartRecording = async () => {
    if (!recordingCanvasRef.current) {
      showToast('error', '캔버스를 찾을 수 없습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    if (isCountingDown || isRecording) {
      showToast('warning', '이미 녹화 중입니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    try {
      // /* console.log('🎬 영상 녹화 시작...'); */

      // 캔버스에서 영상 녹화 시작
      recordingCanvasRef.current.startVideoRecording();

      showToast('success', '영상 녹화가 시작되었습니다!', {
        duration: 2000,
        position: 'top-center',
      });
    } catch (error) {
      /* console.error('❌ 영상 녹화 시작 실패:', error); */
      showToast('error', `녹화 시작 실패: ${error.message}`, {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  // 영상 녹화 중지 핸들러
  const handleStopRecording = async () => {
    if (!recordingCanvasRef.current) {
      showToast('error', '캔버스를 찾을 수 없습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    if (!isRecording) {
      showToast('warning', '녹화 중이 아닙니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    try {
      // /* console.log('🛑 영상 녹화 중지...'); */

      // 캔버스에서 영상 녹화 중지
      recordingCanvasRef.current.stopVideoRecording();

      showToast('success', '🛑 영상 녹화가 완료되었습니다!', {
        duration: 2000,
        position: 'top-center',
      });

      // 저장 모달 자동 열기는 useEffect에서 처리
    } catch (error) {
      /* console.error('❌ 영상 녹화 중지 실패:', error); */
      showToast('error', `녹화 중지 실패: ${error.message}`, {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  // 영상 녹화 완료 시 자동 모달 열기
  useEffect(() => {
    // 녹화가 완료되고 비디오가 생성되었을 때 모달 열기
    if (!isRecording && (recordedVideo || uploadError)) {
      // 영상 데이터 설정 (기존 store 데이터 활용)
      const { recordedVideoBlob } = useRecordingStore.getState();

      if (recordedVideoBlob) {
        const videoData = {
          blob: recordedVideoBlob,
          url: recordedVideo,
          fileName: `CLOV_video_${Date.now()}.mp4`, // 또는 실제 포맷에 맞게
          type: 'video',
          timestamp: Date.now(),
        };

        setCapturedMedia(videoData); // null이 아닌 실제 데이터 설정
      }
      setModalType('video'); // 영상 모달 타입 설정

      // 약간의 지연을 두고 모달 열기 (상태 업데이트 완료 보장)
      setTimeout(() => {
        setSearchParams({ showSave: 'true' });
      }, 100);
    }
  }, [isRecording, recordedVideo, uploadError, setSearchParams]);

  const handleCloseSaveModal = () => {
    // /* console.log('🔄 SaveModal 닫기 시작'); */

    // 저장 모달 닫기
    setSearchParams({});
    setCapturedMedia(null); // 촬영된 미디어 초기화
    setModalType(null); // 모달 타입 초기화

    // 추가적인 상태 정리 (영상 녹화 완료 후)
    if (modalType === 'video' && (recordedVideo || uploadError)) {
      resetRecording();
    }

    // /* console.log('✅ SaveModal 닫기 완료'); */
  };

  const handleContinueRecording = () => {
    // 같은 방에서 계속 촬영
    handleCloseSaveModal();

    // 녹화 상태 초기화 (RecordingStore)
    resetRecording();

    showToast('info', '새로운 촬영을 시작할 수 있습니다.', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const handleGoHome = () => {
    // 홈으로 이동
    resetRecording(); // 상태 정리
    navigate('/');
  };

  const handleMessage = useSocketEvents();

  // 모바일 메뉴 토글 핸들러
  const handleMobileMenuToggle = () => {
    const willShow = !showMobileSideMenu;
    setShowMobileSideMenu(willShow);

    // 모바일에서 사이드메뉴를 열 때 디폴트로 필터 선택
    if (willShow && !activeMenu) {
      setActiveMenu('filter');
    }
  };

  // WebSocket 연결 useEffect
  useEffect(() => {
    if (!accessChecked) return;

    const roomCode = useRoomStore.getState().roomCode;
    const clientId = useRoomStore.getState().clientId;
    const nickname = useUserStore.getState().nickname;

    if (!roomCode || !clientId || !nickname) return;

    if (!isSocketOpen()) {
      /* console.log(`🔌 [SOCKET] WebSocket 연결 시도 → join-room 발송 예정`); */
      connectWebSocket(roomCode, clientId, handleMessage, () => {
        sessionStorage.setItem('joinedRoom', 'true');
        // console.log(`📤 [SOCKET] join-room 발송:`, {
        //   roomCode,
        //   clientId,
        //   nickname,
        // });
        sendEvent('join-room', { roomCode, clientId, nickname });
      });
    }

    // 연결 후 플래그 리셋
    setAccessChecked(false);
  }, [accessChecked]);

  // ✅ 언마운트 시 leave-room
  useEffect(() => {
    if (!accessChecked) return;
    const hasJoined = sessionStorage.getItem('joinedRoom') === 'true';
    if (!hasJoined) return;

    return () => {
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry?.type === 'reload') {
        /* console.log('♻️ 새로고침 → leave-room 생략'); */
        return;
      }
      /* console.log('📤 leave-room 발송'); */
      safelyLeaveRoom();
    };
  }, [accessChecked]);

  // // room-expired 이벤트 리스너
  // useEffect(() => {
  //   const handler = () => setShowRoomExpiredModal(true);
  //   window.addEventListener('room-expired', handler);
  //   return () => window.removeEventListener('room-expired', handler);
  // }, []);

  // useEffect(() => {
  //   const handler = () => setShowHostLeftModal(true);
  //   window.addEventListener('host-left', handler);
  //   return () => window.removeEventListener('host-left', handler);
  // }, []);

  useEffect(() => {
    const handlers = {
      'room-expired': async () => {
        await safelyLeaveRoom(); // 모달 띄우기 전에 클린업
        setShowRoomExpiredModal(true);
      },
      'host-left': async () => {
        await safelyLeaveRoom(); // 모달 띄우기 전에 클린업
        setShowHostLeftModal(true);
      },
      'host-changed': async () => {
        // console.log('👤 [host-changed] 이벤트 수신됨');
      },
    };

    const eventNames = Object.keys(handlers);

    eventNames.forEach((eventName) => {
      window.addEventListener(eventName, handlers[eventName]);
    });

    return () => {
      eventNames.forEach((eventName) => {
        window.removeEventListener(eventName, handlers[eventName]);
      });
    };
  }, []);

  // 모바일과 데스크톱 레이아웃 분기
  const renderLayout = () => {
    if (isMobile) {
      return (
        <MobileLayout
          recordingCanvasRef={recordingCanvasRef}
          handleTakePhoto={handleTakePhoto}
          handleStartRecording={handleStartRecording}
          handleStopRecording={handleStopRecording}
          setShowHelpModal={setShowHelpModal}
          showHelpModal={showHelpModal}
          isRecording={isRecording}
          isCountingDown={isCountingDown}
          onMenuToggle={handleMobileMenuToggle}
          showSideMenu={showMobileSideMenu}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      );
    }

    // 데스크톱 레이아웃 (기존 코드 유지)
    return (
      <div className='flex h-screen w-screen bg-[var(--color-background)]'>
        <SideMenu onMenuSelect={setActiveMenu} activeMenu={activeMenu} />

        {/* 왼쪽 영역: 영상/녹화/버튼 */}
        <div className='flex-1 flex flex-col items-center justify-center p-6'>
          <div className='w-full max-w-[960px] aspect-video bg-black rounded-xl shadow-lg mb-6 overflow-hidden'>
            {/* 🆕 ref를 통한 캔버스 제어 */}
            <RecordingCanvas ref={recordingCanvasRef} />
          </div>

          {/* 🆕 개선된 상태 표시 */}
          {/* {isCountingDown && (
            <div className='text-orange-500 font-bold mb-4 animate-pulse'>
              촬영 준비 중...
            </div>
          )} */}

          {/* {isRecording && (
            <div className='text-red-500 font-bold mb-4 flex items-center gap-2'>
              <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></span>
              녹화 중...
            </div>
          )} */}

          {/* 🆕 개선된 녹화 컨트롤 */}
          <RecordingControls
            isRecording={isRecording}
            isCountingDown={isCountingDown}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onTakePhoto={handleTakePhoto}
            onShowHelp={() => setShowHelpModal(true)} // 도움말 모달 표시
            disabled={isCountingDown} // 카운트다운 중 비활성화
          />
        </div>

        {/* 오른쪽 설정 패널 */}
        <aside className='w-[340px] p-5 bg-[var(--color-card-background)] border-l border-[var(--border-color-default)] flex flex-col h-full'>
          <div className='shrink-0'>
            <RoomInfo />
          </div>
          <div className='max-h-[200px] mt-2'>
            <ParticipantList />
          </div>
        </aside>
      </div>
    );
  };

  return (
    <>
      {/* 레이아웃 렌더링 */}
      {renderLayout()}

      {/* 🔒 권한 프롬프트: 접근 검증 통과 후 언제든 overlay로 뜸 */}
      {/* <PermissionPrompt
        state={camera.permissions.state}
        loading={camera.permissions.loading}
        onRequest={camera.permissions.requestBoth}
        platformHelp={camera.permissions.platformHelp}
        onRefresh={camera.permissions.refresh}
      /> */}

      {/* 공통 모달들 */}
      {/* 개선된 저장 모달 - 촬영된 미디어 전달 */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={handleCloseSaveModal}
        onContinueRecording={handleContinueRecording}
        onGoHome={handleGoHome}
        capturedMedia={capturedMedia} // 사진 데이터 전달
      />

      {/* 도움말 모달 */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* 컨펌 모달 */}
      <Modal isOpen={isModalOpen} onClose={handleCancel}>
        <h2 className='text-xl font-bold mb-2'>
          {isHost ? '방장님, 정말 나가시겠어요?' : '정말 나가시겠어요?'}
        </h2>
        <p className='text-[var(--color-text-secondary)]'>
          {isHost
            ? '방장이 방에서 나가면 방이 종료됩니다.'
            : '녹화실을 나가면 방에서 퇴장하게 됩니다.'}
        </p>
        <div className='flex mt-4 justify-center'>
          <Button
            onClick={handleCancel}
            className='flex-1 text-sm py-2 px-4 rounded transition-colors mx-1'
            variant='primary'
          >
            {isHost ? '방 유지하기' : '계속 놀기'}
          </Button>
          <Button
            onClick={handleConfirm}
            className='flex-1 text-sm py-2 px-4 rounded transition-colors mx-1'
            variant='danger'
          >
            방 나가기
          </Button>
        </div>
      </Modal>

      {/* 방장 퇴장 모달 */}
      <Modal
        isOpen={showHostLeftModal}
        onClose={() => {}}
        closeOnBackdrop={false}
        closeOnEscape={false}
        showCloseButton={false}
      >
        <h2 className='text-xl font-bold mb-2 text-center'>
          방장이 퇴장하여 방이 종료되었습니다
        </h2>
        <p className='text-center text-[var(--color-text-secondary)]'>
          홈으로 이동하여 다시 참여해주세요.
        </p>
        <div className='flex justify-center mt-6'>
          <Button
            variant='primary'
            className='px-6 py-2 text-sm'
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </Button>
        </div>
      </Modal>
      {/* 방 만료 모달 */}
      <Modal
        isOpen={showRoomExpiredModal}
        onClose={() => {}}
        closeOnBackdrop={false}
        closeOnEscape={false}
        showCloseButton={false}
      >
        <h2 className='text-xl font-bold mb-2 text-center'>
          방이 만료되었습니다
        </h2>
        <p className='text-center text-[var(--color-text-secondary)]'>
          홈으로 이동하여 다시 참여해주세요.
        </p>
        <div className='flex justify-center mt-6'>
          <Button
            variant='primary'
            className='px-6 py-2 text-sm'
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default RecordingRoom;
