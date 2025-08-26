package com.clov.backend.common.redis;

import com.clov.backend.common.metrics.RealTimeWebRTCMetrics;
import com.clov.backend.common.metrics.RoomDistributionMetrics;
import com.clov.backend.common.redis.repository.RedisRepository;
import com.clov.backend.domain.participant.entity.Participant;
import com.clov.backend.domain.participant.repository.ParticipantRepository;
import com.clov.backend.domain.room.repository.RoomRepository;
import com.clov.backend.common.enums.RoomStatus;
import com.clov.backend.domain.room.websocket.WebSocketMessageSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Redis TTL 만료 이벤트를 수신하여 방 데이터를 정리하고 DB 상태를 업데이트하는 리스너입니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisExpirationListener implements MessageListener {

    private final RedisRepository redisRepository;
    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;
    private final RealTimeWebRTCMetrics realTimeMetrics;
    private final RoomDistributionMetrics distributionMetrics;
    private final WebSocketMessageSender messageSender;

    /**
     * Redis로부터 TTL 만료 이벤트를 수신하여 처리합니다.
     * @param message 만료된 키 (roomCode)
     * @param pattern 구독한 패턴 (예: __keyevent@0__:expired)
     */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = message.toString();
        //log.info("[Redis TTL Expired] 만료된 키 수신: {}", expiredKey);

        // TTL 키는 roomCode 자체 (6자리 영숫자 코드)
        if (expiredKey.matches("^[A-Za-z0-9]{6}$")) {
            String roomCode = expiredKey;


            roomRepository.findByRoomCode(roomCode).ifPresent(room -> {
                // [MySQL] 방 나가기 처리
                // DB의 Room 상태를 CLOSED로 변경
                room.setStatus(RoomStatus.CLOSED);
                // DB의 Room 닫힌 시각을 지금으로 변경
                room.setClosedAt(OffsetDateTime.now());

                roomRepository.save(room);

                // 참가자 조회
                List<Participant> participants = participantRepository.findByRoom(room);
                int count = participants.size();

                // [메트릭 처리] : 각 참가자의 leftAt 업데이트 및 메트릭 처리
                OffsetDateTime leftAt = OffsetDateTime.now();
                for (Participant p : participants) {
                    p.updateLeftAt(leftAt);
                    participantRepository.save(p);
                    realTimeMetrics.onUserLeftRoom(roomCode, p.getClientId().toString()); //[메트릭 처리] : userLeft처리
                    realTimeMetrics.onUserOffline(p.getClientId().toString()); // [메트릭 처리] :  오프라인 처리
                }

                // [메트릭 처리] : 방 메트릭 제거
                realTimeMetrics.onRoomDeleted(roomCode);
                distributionMetrics.onRoomParticipantCountChanged(roomCode, count, 0);

                // WebSocket 브로드캐스트: 방 만료
                Map<String, Object> payload = Map.of(
                        "event", "room-expired",
                        "data", Map.of(
                                "roomCode", roomCode
                        )
                );

                messageSender.broadcastToRoom(roomCode, payload);
                //log.info("[Redis TTL Expired] Room 폐쇄 처리 완료 - roomCode={}, 참가자 {}명, 현재 온라인={}",roomCode, count, realTimeMetrics.getOnlineUsersCount());
            });

            // Redis의 모든 방 관련 키 제거
            redisRepository.deleteRoom(roomCode);
            //log.info("[Redis TTL Expired] Redis 데이터 삭제 완료 - roomCode={}", roomCode);
        }
    }
}