// src/hooks/useRoomSocket.js

import { useEffect } from 'react';
import { connectWebSocket, sendEvent, closeSocket } from '../services/socket';
import useRoomStore from '../stores/roomStore';
import useUserStore from '../stores/userStore'; // 닉네임 가져오는 전역 상태 있다고 가정
import useSocketEvents from './useSocketEvents'; // 수신 핸들러 (추후 작성)
import { isSocketOpen } from '../services/socket';

export default function useRoomSocket() {
  const roomCode = useRoomStore((state) => state.roomCode);
  const clientId = useRoomStore((state) => state.clientId);
  const nickname = useUserStore((state) => state.nickname); // 사용자 닉네임
  const handleSocketMessage = useSocketEvents(); // 이벤트 분기 훅

  useEffect(() => {
    if (!roomCode || !clientId || !nickname) {
      /* console.warn('⏳ 소켓 연결 조건 불충분. 대기 중...'); */
      return;
    }

    // 연결 + join-room 전송
    /* console.log('🌐 useRoomSocket: connecting...'); */
    connectWebSocket(roomCode, clientId, handleSocketMessage, () => {
      sendEvent('join-room', {
        roomCode,
        clientId,
        nickname,
      });
    });

    // 언마운트 시 leave-room 전송
    return () => {
      if (isSocketOpen()) {
        sendEvent('leave-room', {
          roomCode,
          clientId,
        });
      }
      closeSocket();
    };
  }, [roomCode, clientId, nickname, handleSocketMessage]);
}
