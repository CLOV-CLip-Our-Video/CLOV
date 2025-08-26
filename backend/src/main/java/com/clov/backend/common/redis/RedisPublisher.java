package com.clov.backend.common.redis;

import com.clov.backend.domain.roomstate.dto.RoomMessageDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Redis Pub/Sub을 통해 메시지를 발행하는 클래스입니다.
 * 클라이언트가 보낸 WebSocket 메시지를 Redis로 전파합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 특정 채널(roomCode)에 메시지를 발행합니다.
     * @param roomCode 방 코드 (Redis Pub/Sub 채널 이름)
     * @param message 전송할 메시지 객체
     */
    public void publish(String roomCode, RoomMessageDto message) {
        try {
            // 메시지를 {"event": ..., "data": {...}} 형태로 래핑
            var wrappedMessage = new java.util.HashMap<String, Object>();
            wrappedMessage.put("event", message.getEvent());
            wrappedMessage.put("data", message);

            // 이 wrappedMessage를 직렬화해야 함
            String payload = objectMapper.writeValueAsString(wrappedMessage);

            redisTemplate.convertAndSend("room:" + roomCode, payload);
            //log.info("[REDIS] Published to channel room:{} → {}", roomCode, payload);
        } catch (JsonProcessingException e) {
            //log.error("[REDIS] Failed to serialize message: {}", e.getMessage());
        }
    }
}
