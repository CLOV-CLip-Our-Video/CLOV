/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore, useVideoEffectsStore } from '../../../stores';
import useCameraStore from '../../../stores/cameraStore';
import useCanvasParticipantsStore from '../../../stores/canvasParticipantsStore';
import SliderBar from '../../common/SliderBar/SliderBar';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import VoiceVolumeBar from './components/VoiceVolumeBar';
import CameraModeSelector from '../CameraModeSelector/CameraModeSelector';
import VideoPreview from '../../../pages/WaitingRoom/components/VideoPreview/VideoPreview';
import { showToast } from '../../common/Toast/toast';
import useUserStore from '../../../stores/userStore';
import { safelyLeaveRoom } from '../../../utils/safelyLeaveRoom';
import { sendEvent } from '../../../services/socket';
import { ROTATION_SETTINGS } from '../../../utils/constants';
import AssignHostModal from './components/AssignHostModal';
import { assignHost } from '../../../services/apiUtils';
import { FaMicrophone } from 'react-icons/fa';

const RoomInfo = () => {
  const isHost = useRoomStore((state) => state.isHost);
  const nickname = useUserStore((state) => state.nickname);
  const roomCode = useRoomStore((state) => state.roomCode);
  const clientId = useRoomStore((state) => state.clientId);
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const videoPreviewRef = useRef(null);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const { participantsState, updateParticipantState } =
    useCanvasParticipantsStore();

  // Zustand에서 모든 상태 액션 가져오기
  const {
    isVideoEnabled: isCameraOn,
    isAudioEnabled: isMicOn,
    transparency,
    size,
    rotation,
    cameraMode,
    localStream, // 현재 스트림 상태
    setVideoEnabled,
    setAudioEnabled,
    setTransparency,
    setSize,
    setRotation,
    setCameraMode,
    setLocalStream,
  } = useCameraStore();

  // 필터 상태
  const {
    selectedFilter,
    canvasOpacity,
    canvasScale,
    setCanvasOpacity,
    setCanvasScale,
  } = useVideoEffectsStore();

  // VideoPreview용 투명도 값을 동기화
  useEffect(() => {
    // console.log(
    // '🔄 RoomInfo transparency 변경, VideoEffectsStore 업데이트:',
    // transparency
    // );
    setCanvasOpacity(transparency);
  }, [transparency, setCanvasOpacity]);

  // 카메라 토글 핸들러 - 직접 구현
  const toggleCamera = async () => {
    try {
      if (localStream) {
        // 카메라가 켜져 있으면 끄기
        // console.log('🔄 카메라 끄기 시작');

        // 모든 트랙 정지
        localStream.getTracks().forEach((track) => {
          track.stop();
          // console.log(`🛑 트랙 정지: ${track.kind}`);
        });

        // 상태 업데이트
        setLocalStream(null);
        setVideoEnabled(false);
        setAudioEnabled(false);

        // console.log('✅ 카메라 끄기 완료');
        showToast('success', '카메라가 꺼졌습니다.', {
          position: 'top-center',
          duration: 1500,
        });
      } else {
        // 카메라가 꺼져 있으면 켜기
        // console.log('🔄 카메라 켜기 시작');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1,
            latency: 0.01,
            volume: 0.8,
            // 고급 노이즈 처리
            googEchoCancellation: true,
            googNoiseSuppression: true,
            googAutoGainControl: true,
            googHighpassFilter: true,
            googTypingNoiseDetection: true,
            googNoiseReduction: true,
          },
        });

        // 마이크는 기본적으로 끄기
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });

        // 상태 업데이트
        setLocalStream(stream);
        setVideoEnabled(true);
        setAudioEnabled(false);

        // console.log('✅ 카메라 켜기 완료');
        showToast('success', '카메라가 켜졌습니다.', {
          position: 'top-center',
          duration: 1500,
        });
      }
    } catch (error) {
      console.error('❌ 카메라 토글 실패:', error);
      showToast('error', `카메라 설정 실패: ${error.message}`, {
        position: 'top-center',
        duration: 2000,
      });
    }
  };

  const toggleMic = async () => {
    // console.log('🎤 toggleMic 호출:', {
    //   localStream: !!localStream,
    //   audioTracks: localStream?.getAudioTracks().length || 0,
    //   firstTrackEnabled: localStream?.getAudioTracks()[0]?.enabled,
    //   isAudioEnabled: isMicOn,
    // });

    try {
      if (!localStream) {
        showToast('warning', '먼저 카메라를 켜주세요.');
        return;
      }

      const audioTracks = localStream.getAudioTracks();

      if (audioTracks.length === 0) {
        // 🔧 수정: 새 오디오 트랙 추가 로직 개선
        // console.log('🎤 오디오 트랙이 없음, 새로 생성');

        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1,
            latency: 0.01,
            volume: 0.8,
            // 고급 노이즈 처리
            googEchoCancellation: true,
            googNoiseSuppression: true,
            googAutoGainControl: true,
            googHighpassFilter: true,
            googTypingNoiseDetection: true,
            googNoiseReduction: true,
          },
        });

        const audioTrack = audioStream.getAudioTracks()[0];
        if (audioTrack) {
          localStream.addTrack(audioTrack);

          // ✅ 추가: 트랙 상태 즉시 확인
          // console.log('🎤 새 트랙 추가 후 상태:', {
          //   trackEnabled: audioTrack.enabled,
          //   trackReadyState: audioTrack.readyState,
          // });

          setAudioEnabled(true);
          showToast('success', '마이크가 켜졌습니다.');
        }
      } else {
        // ✅ 수정: 기존 트랙 토글 로직 강화
        const audioTrack = audioTracks[0];

        // console.log('🎤 기존 트랙 토글 전 상태:', {
        //   currentEnabled: audioTrack.enabled,
        //   readyState: audioTrack.readyState,
        //   muted: audioTrack.muted,
        // });

        const newEnabled = !audioTrack.enabled;

        // 🔧 핵심 수정: 트랙 상태를 여러 번 확인하며 설정
        audioTrack.enabled = newEnabled;

        // ✅ 추가: 설정 후 즉시 재확인
        setTimeout(() => {
          // console.log('🎤 토글 후 실제 상태:', {
          //   requestedEnabled: newEnabled,
          //   actualEnabled: audioTrack.enabled,
          //   readyState: audioTrack.readyState,
          // });

          // 🔧 강제 동기화: 실제 트랙 상태와 Zustand 상태 맞춤
          setAudioEnabled(audioTrack.enabled);
        }, 100);

        // 🔧 임시 해결: Zustand 상태를 즉시 업데이트
        setAudioEnabled(newEnabled);

        showToast('success', `마이크가 ${newEnabled ? '켜졌' : '꺼졌'}습니다.`);
      }
    } catch (error) {
      console.error('❌ 마이크 토글 실패:', error);
      showToast('error', `마이크 설정 실패: ${error.message}`);
    }
  };

  // 상태 업데이트 함수
  const updateMyState = useCallback(() => {
    if (clientId && roomCode) {
      const currentState = participantsState[clientId] || {
        x: 100,
        y: 100,
        scale: 1.0,
        opacity: 1.0,
      };

      const updatedState = {
        ...currentState,
        scale: size / 100, // size(50-200) -> scale(0.5-2.0)
        opacity: transparency / 100, // transparency(0-100) -> opacity(0-1)
        rotation: rotation, // 회전 각도 (0-359도)
        mode: cameraMode,
        filter: selectedFilter?.name || null,
        isMicOn: isMicOn,
      };

      // console.log('🔄 RoomInfo 설정 변경, 상태 전송:', updatedState);

      updateParticipantState(clientId, updatedState);
      sendEvent('update-state', {
        roomCode,
        clientId,
        state: updatedState,
      });
    }
  }, [
    clientId,
    roomCode,
    participantsState,
    size,
    transparency,
    rotation,
    cameraMode,
    selectedFilter,
    updateParticipantState,
    isMicOn,
  ]);

  // 설정 변경 시 자동 상태 전송
  useEffect(() => {
    updateMyState();
  }, [cameraMode, transparency, size, rotation, selectedFilter, isMicOn]);

  // 🔧 RoomInfo 컴포넌트에 추가: 오디오 트랙 상태 모니터링
  useEffect(() => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    // 트랙 이벤트 리스너 추가
    const handleTrackEnded = () => {
      // console.log('🎤 오디오 트랙 종료됨');
      setAudioEnabled(false);
    };

    const handleTrackMute = () => {
      // console.log('🎤 오디오 트랙 음소거됨');
    };

    const handleTrackUnmute = () => {
      // console.log('🎤 오디오 트랙 음소거 해제됨');
    };

    audioTrack.addEventListener('ended', handleTrackEnded);
    audioTrack.addEventListener('mute', handleTrackMute);
    audioTrack.addEventListener('unmute', handleTrackUnmute);

    // 🔧 주기적 상태 체크 (개발용)
    const statusInterval = setInterval(() => {
      // console.log('🎤 트랙 상태 체크:', {
      //   enabled: audioTrack.enabled,
      //   readyState: audioTrack.readyState,
      //   muted: audioTrack.muted,
      //   zustandState: isMicOn,
      // });
    }, 2000);

    return () => {
      audioTrack.removeEventListener('ended', handleTrackEnded);
      audioTrack.removeEventListener('mute', handleTrackMute);
      audioTrack.removeEventListener('unmute', handleTrackUnmute);
      clearInterval(statusInterval);
    };
  }, [localStream, isMicOn]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    showToast('success', '방 코드가 클립보드에 복사되었습니다!', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(inviteLink);
    showToast('success', '초대링크가 클립보드에 복사되었습니다!', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const handleLeaveRoom = async () => {
    // 방 나가기 전에 스트림 정리
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    await safelyLeaveRoom();
    navigate('/');
  };

  // 스냅샷 촬영 핸들러
  const handleTakeSnapshot = () => {
    if (videoPreviewRef.current) {
      const snapshot = videoPreviewRef.current.captureSnapshot();
      if (snapshot) {
        // 스냅샷을 다운로드하거나 처리
        const link = document.createElement('a');
        link.download = `CLOV_snapshot_${new Date().getTime()}.png`;
        link.href = snapshot;
        link.click();

        showToast('success', '스냅샷이 저장되었습니다!', {
          position: 'top-center',
          duration: 2000,
        });
      } else {
        showToast('error', '스냅샷 생성에 실패했습니다.', {
          position: 'top-center',
          duration: 2000,
        });
      }
    }
  };

  return (
    <div
      className='p-4 rounded-lg shadow-lg'
      style={{
        backgroundColor: 'var(--color-card-background)',
        border: '1px solid var(--border-color-default)',
      }}
    >
      {/* 방 정보 */}
      <div className='mb-2'>
        <div className='flex items-center gap-2 mb-2'>
          <span
            className='text-sm'
            style={{ color: 'var(--color-text-secondary)' }}
          >
            방 코드:
          </span>
          <code
            className='px-2 py-1 rounded text-sm font-mono cursor-pointer'
            style={{
              backgroundColor: 'var(--color-primary-opacity-10)',
              color: 'var(--color-text)',
            }}
            onClick={copyRoomCode}
          >
            {roomCode}
          </code>
          <Button
            onClick={copyInviteLink}
            variant='primary'
            className='text-xs px-2 py-1 rounded transition-colors'
          >
            초대링크 복사
          </Button>
        </div>
      </div>

      <div className='flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color-default)] bg-white shadow-sm max-w-full'>
        {isHost && (
          <div className='flex items-center gap-1 text-yellow-700 py-0.5 rounded-full text-xs'>
            {/* <span>👑</span> */}
            <span>방장</span>
          </div>
        )}
        <span className='truncate text-sm text-gray-800 max-w-[100px]'>
          {nickname}
        </span>

        {/* 방장 전용 "위임" 버튼 */}
        {isHost && (
          <Button
            variant='primary'
            size='xsmall'
            className='ml-auto text-xs px-2 py-1'
            onClick={() => setAssignModalOpen(true)}
          >
            위임
          </Button>
        )}
      </div>

      {/* VideoPreview 컴포넌트 */}
      <div className='mb-4'>
        <div
          className='flex gap mb-3 p-2 rounded-lg'
          style={{
            backgroundColor: 'var(--color-background)',
            border: '2px solid var(--border-color-default)',
            display: 'none',
          }}
        >
          {/* VideoPreview 영역 */}
          <div
            className='flex-1 relative rounded-lg overflow-hidden'
            style={{
              aspectRatio: '4/3',
              maxHeight: '160px',
              backgroundColor: 'var(--color-card-background)',
              display: 'none',
            }}
          >
            <VideoPreview
              showOverlay={false}
              ref={videoPreviewRef}
              className='w-full h-full'
              transparentBackground={true}
              onEffectsChange={(effects) => {
                // console.log('🎨 RoomInfo 이펙트 변경:', effects);
              }}
            />

            {/* 상태 오버레이 (VideoPreview 위에) */}
            <div className='absolute top-2 left-2 flex gap-1 z-10'>
              <div
                className='w-2 h-2 rounded-full'
                style={{
                  backgroundColor:
                    isCameraOn && localStream
                      ? 'var(--color-camera-on)'
                      : 'var(--color-camera-off)',
                }}
              />
              {/* 마이크 상태 표시 */}
              <div
                className='w-2 h-2 rounded-full'
                style={{
                  backgroundColor:
                    isMicOn && localStream
                      ? 'var(--color-mic-on)'
                      : 'var(--color-mic-off)',
                }}
              />
            </div>

            {/* 카메라 꺼짐 오버레이 */}
            {!localStream && (
              <div className='absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20'>
                <div className='text-center text-white'>
                  <div className='text-2xl mb-2'>📷</div>
                  <div className='text-sm'>카메라 꺼짐</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 카메라 & 마이크 On/Off 버튼 */}
      <div className='flex gap-2 mb-1'>
        <Button
          onClick={toggleCamera}
          className='flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors'
          variant={isCameraOn && localStream ? 'success' : 'danger'}
        >
          카메라 {isCameraOn && localStream ? 'ON' : 'OFF'}
        </Button>

        <Button
          onClick={toggleMic}
          disabled={!localStream}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            !localStream ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          variant={isMicOn && localStream ? 'success' : 'danger'}
        >
          마이크 {isMicOn && localStream ? 'ON' : 'OFF'}
        </Button>
      </div>

      {/* 하단: 마이크 볼륨 표시 */}
      <div className='flex items-center gap-2 mt-3'>
        <span className='text-xs text-[var(--color-text-secondary)] min-w-0 flex-shrink-0 flex gap-1 items-center'>
          <FaMicrophone />
          볼륨
        </span>
        <VoiceVolumeBar
          width={200} // 이 값은 이제 무시되고 부모 컨테이너를 꽉 채움
          height={8}
          showLabel={true}
          sensitivity={1.2}
          orientation='horizontal'
          onVolumeChange={(level, active) => setVolumeLevel(level)}
          className='w-auto' // Tailwind로 전체 너비 사용
        />
        <span className='text-xs font-mono text-[var(--color-text-secondary)] min-w-8'>
          {isMicOn ? `${volumeLevel}%` : '0%'}
        </span>
      </div>

      {/* 카메라 모드 선택 */}
      <div className='mb-1'>
        <CameraModeSelector
          cameraModes={{ ORIGINAL: 1, PERSON: 2, FACE_ONLY: 3 }}
          // cameraModes={{ FULL: 1, PERSON_ONLY: 2 }}
          currentMode={cameraMode}
          onChange={setCameraMode}
        />
      </div>

      {/* 슬라이더 제어 */}
      <div className='mb-3'>
        <div className='mb-2'>
          <SliderBar
            min={10}
            max={100}
            step={1}
            value={transparency}
            onChange={(e) => setTransparency(parseInt(e.target.value))}
            label='투명도'
            unit='%'
          />
        </div>
        <div className='mb-2'>
          <SliderBar
            min={50}
            max={200}
            step={1}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            label='크기'
            unit='%'
          />
        </div>
        <div>
          <SliderBar
            min={0}
            max={359}
            step={ROTATION_SETTINGS.SNAP_DEGREES}
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            label='회전'
            unit='°'
          />
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className='flex flex-col gap-2'>
        <Button
          className='px-3 py-2 rounded text-sm transition-colors'
          variant='danger'
          onClick={() => setModalOpen(true)}
        >
          {/* 🚪 방 나가기 */}방 나가기
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
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
            onClick={() => setModalOpen(false)}
            className='flex-1 text-sm py-2 px-4 rounded transition-colors mx-1'
            variant='primary'
          >
            {isHost ? '방 유지하기' : '계속 놀기'}
          </Button>
          <Button
            type='button'
            onClick={handleLeaveRoom}
            className='flex-1 text-sm py-2 px-4 rounded transition-colors mx-1'
            variant='danger'
          >
            방 나가기
          </Button>
        </div>
      </Modal>
      <AssignHostModal
        isOpen={isAssignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={async (targetClientId) => {
          try {
            setAssignModalOpen(false);

            // 1. REST API 호출 먼저
            await assignHost(roomCode, clientId, targetClientId);

            // 2. 성공 후에 WebSocket 이벤트 발송
            sendEvent('assign-host', {
              roomCode,
              from: clientId,
              to: targetClientId,
            });

            // console.log('#####################');
            // console.log('방장 위임 완료 후 이벤트 전송:', {
            //   roomCode,
            //   from: clientId,
            //   to: targetClientId,
            // });
            // console.log('#####################');

            // showToast('success', '방장 권한을 성공적으로 위임했습니다.', {
            //   position: 'top-center',
            // });
          } catch (error) {
            console.error('❌ 방장 위임 실패:', error);
            showToast('error', '방장 위임에 실패했습니다.', {
              position: 'top-center',
            });
          }
        }}
        currentClientId={clientId}
      />
    </div>
  );
};

export default RoomInfo;
