import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createRoom,
  joinRoom,
  getErrorMessage,
} from '../../../services/apiUtils';
import {
  connectWebSocket,
  sendEvent,
  closeSocket,
} from '../../../services/socket';
import useSocketEvents from '../../../hooks/useSocketEvents';
import useCanvasParticipantsStore from '../../../stores/canvasParticipantsStore';
import useRoomStore from '../../../stores/roomStore';
import useUserStore from '../../../stores/userStore';
import useSessionStore from '../../../stores/sessionStore';

const useRoomEntry = () => {
  const navigate = useNavigate();
  const { roomId: roomCode } = useParams(); // URL에서 roomId 가져오기
  const [isEntering, setIsEntering] = useState(false);

  const onMessage = useSocketEvents();
  const setAllParticipants = useCanvasParticipantsStore(
    (s) => s.setAllParticipantsFromSync
  );
  const { setRoomCode, setClientId, setIsHost } = useRoomStore();
  const { setNickname } = useUserStore();

  // 방 입장 핸들러
  const handleEnterRoom = async () => {
    setIsEntering(true);

    try {
      const entryType = sessionStorage.getItem('entryType'); // 'create' or 'join'
      // const roomCode = useRoomStore.getState().roomCode; // join일 경우 사전 저장된 값
      const nickname = useUserStore.getState().nickname;

      // //  1. 이전 소켓 정리 (leave-room 전송 후 연결 종료)
      // const prevRoomCode = useRoomStore.getState().roomCode;
      // const prevClientId = sessionStorage.getItem('clientId');

      // if (prevRoomCode && prevClientId) {
      //   sendEvent('leave-room', {
      //     roomCode: prevRoomCode,
      //     clientId: prevClientId,
      //   });
      // }
      // closeSocket();

      //  2. 방 생성 or 참여
      let apiResponse;

      if (entryType === 'create') {
        apiResponse = await createRoom(nickname);
        // /* console.log('방 생성 응답:', apiResponse.data); */
      } else if (entryType === 'join') {
        if (!roomCode || roomCode === 'createroom') {
          // /* console.log('현재 룸코드: ', roomCode); */
          alert('비정상적인 방 코드입니다.');
          navigate('/');
          return;
        }
        apiResponse = await joinRoom(roomCode, nickname);
        /* console.log('방 참여 응답:', apiResponse); */
      } else {
        alert('잘못된 접근입니다. 홈으로 이동합니다.');
        navigate('/');
        return;
      }

      // apiUtils에서 응답 구조 변경에 따라 수정
      const {
        roomCode: finalCode,
        hostId,
        clientId,
        isHost,
        participants,
      } = apiResponse.data;

      const myId = clientId || hostId;

      // 상태 저장
      setRoomCode(finalCode);
      setClientId(myId);
      setIsHost(isHost);
      setNickname(nickname);

      if (Array.isArray(participants)) {
        setAllParticipants(participants);

        // ✅ 디버깅 로그 추가
        // const participantsState =
        //   useCanvasParticipantsStore.getState().participantsState;

        // /* console.log('🧩 participantsState:', participantsState); */
        // /* console.log('🧍 내 ID:', myId); */
        // /* console.log('📌 내 참가자 정보:', participantsState[myId]); */
      }

      // 세션 저장
      sessionStorage.setItem('clientId', myId);
      sessionStorage.setItem('nickname', nickname);
      sessionStorage.setItem('isHost', String(isHost));

      // 세션 플래그 초기화
      useSessionStore.getState().resetSessionFlags();

      // WebSocket 연결 및 join-room 이벤트 전송
      connectWebSocket(finalCode, myId, onMessage, () => {
        sendEvent('join-room', {
          roomCode: finalCode,
          clientId: myId,
          nickname,
        });

        // 연결 후 페이지 이동
        // 유효한 세션 플래그 설정
        sessionStorage.setItem('validRoomEntry', 'true');
        navigate(`/room/${finalCode}`);
      });
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      /* console.error('방 입장 실패:', errorMessage); */
      alert('방 입장에 실패했습니다.');
    } finally {
      setIsEntering(false);
    }
  };

  return {
    isEntering,
    handleEnterRoom,
  };
};

export default useRoomEntry;
