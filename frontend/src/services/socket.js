// src/services/socket.js

let socket = null;

/**
 * WebSocket 연결
 */
export const connectWebSocket = (
  roomCode,
  clientId,
  onMessageCallback,
  onOpenCallback
) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    /* console.warn('🔁 이미 열린 WebSocket 연결 존재. 재사용'); */
    return;
  }

  const url = `wss://clov.co.kr/ws?roomCode=${roomCode}&clientId=${clientId}`;
  // const url = `wss://dev.clov.co.kr/ws?roomCode=${roomCode}&clientId=${clientId}`;
  socket = new WebSocket(url);

  socket.onopen = () => {
    // console.log('✅ WebSocket connected');
    if (typeof onOpenCallback === 'function') {
      onOpenCallback(); // 연결 후 호출
    }
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      // console.log('📥 [onMessage] 이벤트 처리됨:', message);
      onMessageCallback?.(message);
    } catch (e) {
      // console.error('❌ JSON 파싱 실패:', e);
      // console.warn('⚠️ [onMessage] 이벤트 처리 중 오류 발생', event.data);
    }
  };

  // socket.onerror = (err) => console.error('WebSocket Error:', err);
  // socket.onclose = () => console.log('❌ WebSocket disconnected');
};

/**
 * WebSocket 이벤트 전송
 */
export const sendEvent = (event, data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload = { event, data };

    // console.log(
    //   '🚀 [sendEvent] 전송 직전 payload:',
    //   JSON.stringify(payload, null, 2)
    // );

    socket.send(JSON.stringify(payload));
    // console.log(`📤 [sendEvent] '${event}' 전송됨:`);
  } else {
    // console.warn('⚠️ WebSocket 연결 상태가 아님, 전송 실패:', event);
  }
};

/**
 * WebSocket 종료
 */
export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    // /* console.log('연결되어있던 소켓 연결 종료'); */
  }
};

export const isSocketOpen = () => {
  return socket && socket.readyState === WebSocket.OPEN;
};
