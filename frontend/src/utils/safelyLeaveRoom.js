// utils/safelyLeaveRoom.js
import { sendEvent, closeSocket } from '../services/socket';
import { leaveRoom, getErrorMessage } from '../services/apiUtils';
import useRoomStore from '../stores/roomStore';
import useSessionStore from '../stores/sessionStore';

/**
 * 방 퇴장을 안전하게 처리 (소켓 이벤트 + REST + 상태 정리)
 */
export async function safelyLeaveRoom() {
  const roomCode = useRoomStore.getState().roomCode;
  const clientId = useRoomStore.getState().clientId;
  const { hasLeftRoom, setHasLeftRoom } = useSessionStore.getState();

  sessionStorage.removeItem('validRoomEntry');
  sessionStorage.removeItem('entryType');

  if (!roomCode || !clientId || hasLeftRoom) return;

  try {
    sendEvent('leave-room', { roomCode, clientId });
    await leaveRoom(roomCode, clientId);
    // /* console.log('✅ 정상 퇴장 처리'); */
  } catch (err) {
    const errorMessage = getErrorMessage(err);
    // /* console.error('❌ 퇴장 처리 실패:', errorMessage); */
  }

  closeSocket();
  setHasLeftRoom(true);
  useRoomStore.getState().resetRoom();
}
