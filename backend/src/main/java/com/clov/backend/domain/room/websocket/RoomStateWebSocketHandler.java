package com.clov.backend.domain.room.websocket;

import com.clov.backend.common.enums.RoomStatus;
import com.clov.backend.common.metrics.RealTimeWebRTCMetrics;
import com.clov.backend.common.metrics.RoomDistributionMetrics;
import com.clov.backend.common.redis.RedisPublisher;
import com.clov.backend.common.redis.repository.RedisRepository;
import com.clov.backend.domain.participant.entity.Participant;
import com.clov.backend.domain.participant.repository.ParticipantRepository;
import com.clov.backend.domain.room.repository.RoomRepository;
import com.clov.backend.domain.roomstate.dto.RoomMessageDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 클라이언트 WebSocket 메시지를 처리하고 Redis에 퍼블리시하거나 SDP/ICE를 직접 릴레이하는 핸들러입니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RoomStateWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final RedisPublisher redisPublisher;
    private final WebSocketSessionManager sessionManager;
    private final RedisRepository redisRepository;
    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;
    private final WebSocketMessageSender messageSender;
    private final RealTimeWebRTCMetrics realTimeMetrics;
    private final RoomDistributionMetrics distributionMetrics;


    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessionManager.registerSession(session);
        //log.info("[WebSocket] 연결됨: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            String payload = message.getPayload();
            JsonNode root = objectMapper.readTree(payload);
            String event = root.get("event").asText();
            JsonNode dataNode = root.get("data");

            // SDP/ICE 메시지는 직접 릴레이
            if (event.equals("sdp-offer") || event.equals("sdp-answer") || event.equals("ice-candidate")) {
                String targetClientId = dataNode.get("target").asText();

                Map<String, Object> relayPayload = Map.of(
                        "event", event,
                        "data", objectMapper.convertValue(dataNode, Map.class)
                );

                String relayJson = objectMapper.writeValueAsString(relayPayload);
                sessionManager.sendToClient(targetClientId, relayJson);
                //log.info("[WebSocket] {} 릴레이 완료 → targetClientId: {}", event, targetClientId);
                return;
            }

            // 일반 이벤트는 Redis에 퍼블리시
            RoomMessageDto dto = objectMapper.treeToValue(dataNode, RoomMessageDto.class);
            dto.setEvent(event);
            redisPublisher.publish(dto.getRoomCode(), dto);
            //log.info("[WebSocket] 메시지 수신 및 Redis 퍼블리시: {}", dto.getRoomCode());

        } catch (Exception e) {
            //log.error("[WebSocket] 메시지 처리 중 오류 발생", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionManager.removeSession(session);
        //log.info("[WebSocket] 연결 종료됨: {}", session.getId());

        try {
            // URI에서 roomCode, clientId 추출
            String roomCode = sessionManager.getRoomCodeFromSession(session);
            String clientIdStr = sessionManager.getClientIdFromSession(session);
            UUID clientId = UUID.fromString(clientIdStr);
            OffsetDateTime leftAt = OffsetDateTime.now();

            // 기존 참가자 수 가져오기 (분포 메트릭용)
            int participantCountBefore = redisRepository.getParticipantCount(roomCode);

            // 닉네임 및 호스트 여부 조회
            String nickname = redisRepository.getNickname(roomCode, clientId);
            boolean isHost = redisRepository.isHost(roomCode, clientId);


            // 참여자 DB에 leftAt 반영
            Participant participant = participantRepository.findByClientId(clientId);
            if (participant != null) {
                participant.updateLeftAt(leftAt);
                participantRepository.save(participant);
            }

            // 방장인 경우: 방 폐쇄
            if (isHost) {
                // [메트릭 처리] : 모든 참가자에 대한 메트릭 반영
                List<String> participants = redisRepository.getParticipants(roomCode);
                for (String pid : participants) {
                    realTimeMetrics.onUserLeftRoom(roomCode, pid);
                    realTimeMetrics.onUserOffline(pid);
                }

                // 방 제거
                redisRepository.deleteRoom(roomCode);

                // DB의 Room 상태도 변경
                roomRepository.findByRoomCode(roomCode).ifPresent(room -> {
                    room.setStatus(RoomStatus.CLOSED);
                    room.setClosedAt(leftAt);
                    roomRepository.save(room);
                });

                //[메트릭 처리] : 방 참여 인원 변경 및 방 폐쇄 반영
                distributionMetrics.onRoomParticipantCountChanged(roomCode, participantCountBefore, 0);
                realTimeMetrics.onRoomDeleted(roomCode);

                //log.info("방 폐쇄 완료: roomCode={}, 퇴장참가자수={}, 현재 활성방={}, 총참가자={}, 온라인={}",
                        // roomCode, participantCountBefore,
                        // realTimeMetrics.getActiveRoomsCount(), realTimeMetrics.getTotalClientsCount(),
                        // realTimeMetrics.getOnlineUsersCount());
            } else {
                // 상태 제거 (개별)
                redisRepository.deleteCanvasState(roomCode, clientId);

                // [메트릭 처리] :  leftRoom, 오프라인 처리, 방 참여 인원 변경 메트릭 반영
                realTimeMetrics.onUserLeftRoom(roomCode, clientIdStr);
                realTimeMetrics.onUserOffline(clientIdStr);
                distributionMetrics.onRoomParticipantCountChanged(roomCode, participantCountBefore, participantCountBefore - 1);

                //log.info("참가자 퇴장 완료: roomCode={}, clientId={}, 참가자수 {}→{}, 총참가자={}, 온라인={}",
                        // roomCode, clientIdStr, participantCountBefore, participantCountBefore - 1,
                        // realTimeMetrics.getTotalClientsCount(), realTimeMetrics.getOnlineUsersCount());
            }

            // 남은 참가자 목록 조회
            Map<String, String> participants = redisRepository.getParticipantNicknames(roomCode);

            // user-left 브로드캐스트
            Map<String, Object> payload = Map.of(
                    "event", "user-left",
                    "data", Map.of(
                            "roomCode", roomCode,
                            "lastLeaver", Map.of(
                                    "clientId", clientIdStr,
                                    "nickname", nickname,
                                    "isHost", isHost
                            ),
                            "participants", participants
                    )
            );

            messageSender.broadcastToRoom(roomCode, payload);
            //log.info("[WebSocket] 연결 종료로 인한 퇴장 처리 완료: clientId={}", clientIdStr);
        } catch (Exception e) {
            //log.error("[WebSocket] 연결 종료 후 퇴장 처리 실패", e);
        }
    }
}