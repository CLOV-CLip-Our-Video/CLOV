// src/hooks/useSocketEvents.js
/* eslint-disable */
import useCanvasParticipantsStore from '../stores/canvasParticipantsStore';
import useRoomStore from '../stores/roomStore';
import toast from 'react-hot-toast';

export default function useSocketEvents() {
  const setAll = useCanvasParticipantsStore(
    (s) => s.setAllParticipantsFromSync
  );
  const updateOne = useCanvasParticipantsStore((s) => s.updateParticipantState);
  const removeOne = useCanvasParticipantsStore((s) => s.removeParticipant);
  const resetAll = useCanvasParticipantsStore((s) => s.resetParticipants);
  const setRoomBackground = useRoomStore((s) => s.setRoomBackground);

  return function handleSocketMessage(message) {
    const { event, data } = message;

    switch (event) {
      case 'user-joined': {
        // /* console.log('👥 user-joined:', data); */

        // 새로 입장한 참가자 토스트 표시
        if (data.newComer && data.newComer.nickname) {
          toast.success(`${data.newComer.nickname}님이 입장했습니다!`, {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#10B981',
              color: 'white',
            },
          });
        }

        // 새로 입장한 참가자만 개별적으로 추가 (기존 참가자 위치 유지)
        if (data.newComer && data.newComer.clientId) {
          updateOne(data.newComer.clientId, {
            nickname: data.newComer.nickname,
            x: 100, // 새 참가자만 기본 위치
            y: 100, // 새 참가자만 기본 위치
            scale: 1.0,
            opacity: 1.0,
            isHost: false,
          });
        }

        // WebRTC 이벤트 전달 - App.js 패턴에 맞게 수정
        window.dispatchEvent(
          new CustomEvent('webrtc-event', {
            detail: {
              type: event,
              data: {
                ...data,
                // App.js에서 사용하는 필드명 보장
                newComer: data.newComer,
                participants: data.participants,
              },
            },
          })
        );
        break;
      }

      case 'canvas-sync': {
        // console.log('🧩 canvas-sync:', data);
        setAll(data.participants);
        if (data.background) {
          setRoomBackground(data.background);
        }

        // WebRTC 이벤트 전달
        window.dispatchEvent(
          new CustomEvent('webrtc-event', {
            detail: { type: event, data },
          })
        );
        break;
      }

      case 'state-updated': {
        // console.log('📍 state-updated:', data);
        // /* console.log('🔄 수신된 rotation:', data.state.rotation); */
        updateOne(data.clientId, {
          ...data.state,
          nickname: data.nickname,
          isHost: data.isHost,
          mode: data.state.mode || 1, // 배경 제거 모드
          filter: data.state.filter || null, // 비디오 필터
          overlay: data.state.overlay || null,
        });
        break;
      }

      case 'user-left': {
        // /* console.log('👋 user-left:', data); */
        const { lastLeaver, participants } = data;

        // 퇴장한 참가자 토스트 표시
        if (lastLeaver && lastLeaver.nickname) {
          toast(`${lastLeaver.nickname}님이 퇴장했습니다`, {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#6B7280',
              color: 'white',
            },
          });
        }

        removeOne(lastLeaver.clientId);

        const isLeaverHost = lastLeaver?.isHost;
        const amIHost = useRoomStore.getState().isHost;

        if (isLeaverHost && !amIHost) {
          // /* console.warn('🚨 호스트 퇴장 감지 → 참가자 퇴장 안내'); */
          window.dispatchEvent(new CustomEvent('host-left'));
        }

        // WebRTC 이벤트 전달
        window.dispatchEvent(
          new CustomEvent('webrtc-event', {
            detail: { type: event, data },
          })
        );
        break;
      }

      case 'room-expired': {
        toast.error('방이 만료되었습니다.', {
          duration: 4000,
          style: { background: '#ef4444', color: 'white' },
        });

        // 상태 초기화
        resetAll();
        useRoomStore.getState().resetRoom?.();

        // 브라우저 전역 이벤트 브로드캐스트
        window.dispatchEvent(new CustomEvent('room-expired', { detail: data }));
        break;
      }

      case 'countdown-start': {
        // /* console.log('⏳ countdown-start:', data); */
        // 카운트다운 로직은 기존 유지
        break;
      }

      // WebRTC 시그널링 이벤트들 - App.js 패턴
      case 'sdp-offer': {
        // /* console.log('🔗 sdp-offer 수신:', data); */
        window.dispatchEvent(
          new CustomEvent('webrtc-event', {
            detail: { type: event, data },
          })
        );
        break;
      }

      case 'sdp-answer': {
        // /* console.log('🔗 sdp-answer 수신:', data); */
        window.dispatchEvent(
          new CustomEvent('webrtc-event', {
            detail: { type: event, data },
          })
        );
        break;
      }

      case 'ice-candidate': {
        // /* console.log('🧊 ice-candidate 수신:', data); */
        window.dispatchEvent(
          new CustomEvent('webrtc-event', {
            detail: { type: event, data },
          })
        );
        break;
      }

      case 'host-changed': {
        const { newHost, previousHost, roomCode } = data;
        const myClientId = useRoomStore.getState().clientId;

        // console.log('####################');
        // console.log('호스트 변경 이벤트:', data);
        // console.log('####################');

        // 현재 유저가 새 방장이라면 상태 반영
        if (newHost.clientId === myClientId) {
          useRoomStore.getState().setIsHost(true);
        } else {
          useRoomStore.getState().setIsHost(false);
        }

        // 모든 유저에게 반영
        const participants =
          useCanvasParticipantsStore.getState().participantsState;
        Object.entries(participants).forEach(([id, state]) => {
          const isHost = id === newHost.clientId;
          useCanvasParticipantsStore.getState().updateParticipantState(id, {
            ...state,
            isHost,
          });
        });

        // 토스트 알림
        toast.success(`${newHost.nickname}님이 새로운 방장이 되었습니다`, {
          duration: 3000,
          position: 'top-center',
          style: { background: '#FACC15', color: '#111827' },
        });

        // 외부로 이벤트 브로드캐스트
        window.dispatchEvent(new CustomEvent('host-changed', { detail: data }));

        break;
      }

      case 'background-changed': {
        // console.log('🖼️ background-changed:', data);

        // 스토어에 배경 정보 업데이트
        if (data.background) {
          setRoomBackground({
            backgroundUrl: data.background.backgroundUrl,
            backgroundTitle: data.background.backgroundTitle,
            // 필요한 다른 필드들도 추가
            id: 'server-background',
            name: data.background.backgroundTitle,
            type: 'background',
          });
        }

        // 캔버스에 배경 적용 이벤트 발생
        window.dispatchEvent(
          new CustomEvent('backgroundChanged', {
            detail: {
              background: data.background,
              timestamp: Date.now(),
            },
          })
        );

        // 토스트 알림 (선택적)
        toast.success(
          // `배경이 "${data.background.backgroundTitle}"로 변경되었습니다`,
          `배경이 변경되었습니다`,
          {
            duration: 2000,
            position: 'top-center',
            style: {
              background: '#3B82F6',
              color: 'white',
            },
          }
        );

        break;
      }

      default:
      // console.warn('❓ 알 수 없는 이벤트:', event);
    }
  };
}
