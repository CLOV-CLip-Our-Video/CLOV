package com.clov.backend.domain.canvas.scheduler;

import com.clov.backend.common.redis.repository.RedisRepository;
import com.clov.backend.domain.canvas.dto.response.FullCanvasStateResponse;
import com.clov.backend.domain.room.websocket.WebSocketMessageSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 일정 주기로 Canvas 전체 상태를 브로드캐스트하여 정합성을 유지하는 스케줄러입니다.
 * - 구독자가 있는 방만 전송합니다.
 * - 직전 전송 상태와 비교하여 변경이 있을 때만 전송합니다.
 * - fixedDelay로 중첩 실행을 방지하고, 예외를 격리합니다.
 *
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CanvasStateSyncScheduler {

    private final RedisRepository redisRepository;
    private final WebSocketMessageSender messageSender;

    /** 방별 마지막 전송 상태 해시(동일 상태 재전송 방지) */
    private final Map<String, String> lastStateHash = new ConcurrentHashMap<>();

    /**
     * 이전 실행 종료 기준으로 5초 지연 실행합니다(중첩 실행 방지).
     * 초기 10초 지연으로 기동 직후 부하를 완화합니다.
     */
    @Scheduled(fixedDelay = 15000, initialDelay = 10000)
    public void broadcastAllCanvasStates() {
        try {
            Set<String> activeRoomCodes = redisRepository.getAllRoomCodes();
            if (activeRoomCodes.isEmpty()) {
                //활성 방이 하나도 없을 때 캐시 비우기
                lastStateHash.clear();
                return;
            }

            // 존재하지 않는 방의 캐시 해시 정리 (메모리 누수 방지)
            lastStateHash.keySet().removeIf(roomCode -> !activeRoomCodes.contains(roomCode));

            for (String roomCode : activeRoomCodes) {
                try {
                    // 1) 구독자(웹소켓 세션) 없는 방은 스킵
                    if (!messageSender.hasSubscribers(roomCode)) {
                        continue;
                    }

                    // 2) 전체 상태 조회 (null/빈 참가자면 스킵)
                    FullCanvasStateResponse state = redisRepository.getCanvasState(roomCode);
                    if (state == null || state.getParticipants() == null || state.getParticipants().isEmpty()) {
                        lastStateHash.remove(roomCode);
                        continue;
                    }

                    // 3) 변경 감지(해시 비교) — 동일 상태면 전송 생략
                    String current = hashOf(state);
                    String previous = lastStateHash.get(roomCode);
                    if (current.equals(previous)) {
                        continue;
                    }

                    // 4) 브로드캐스트 및 해시 갱신
                    var payload = Map.of("event", "canvas-sync", "data", state);
                    messageSender.broadcastToRoom(roomCode, payload);
                    lastStateHash.put(roomCode, current);

                } catch (Exception perRoomEx) {
                    /**
                     * 방 단위 예외 격리
                     * @param perRoomEx 개별 방 처리 중 발생한 예외
                     */
                    log.warn("[CanvasStateSyncScheduler] room={} 동기화 실패: {}", roomCode, perRoomEx.getMessage());
                }
            }
        } catch (Exception e) {
            /**
             * 상위 예외 포착: 스케줄러 중단 방지
             * @param e 주기 작업 상위 단계에서 발생한 예외
             */
            log.error("[CanvasStateSyncScheduler] 전체 동기화 프로세스 실패", e);
        }
    }

    /**
     * 전체 상태의 내용 기반 해시 값을 계산합니다.
     * 배경 + 참가자 목록을 문자열로 정규화하여 SHA-256 해시를 생성합니다.
     *
     * @param state 캔버스 전체 상태 응답 DTO
     * @return Base64 인코딩된 SHA-256 해시
     */
    private String hashOf(FullCanvasStateResponse state) {
        try {
            // 참가자 정렬로 해시 안정성 확보
            var participants = new java.util.ArrayList<>(state.getParticipants());
            participants.sort(java.util.Comparator.comparing(p -> p.getClientId().toString()));

            String canonical = String.valueOf(state.getBackground()) + String.valueOf(participants);

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(canonical.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            // 해시 실패 시 매번 전송되지 않도록 임시 토큰 반환
            return "ERR-" + System.nanoTime();
        }
    }
}
