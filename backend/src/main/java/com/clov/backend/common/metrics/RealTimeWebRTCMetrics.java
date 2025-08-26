//package com.clov.backend.common.metrics;
//
//import io.micrometer.core.instrument.Gauge;
//import io.micrometer.core.instrument.MeterRegistry;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.stereotype.Component;
//
//import java.util.Set; // 빠진 import 추가
//import java.util.concurrent.atomic.AtomicInteger;
//
//@Slf4j
//@Component
//public class RealTimeWebRTCMetrics {
//
//    private final MeterRegistry meterRegistry;
//    private final RedisTemplate<String, Object> redisTemplate;
//
//    // 실시간 카운터들
//    private final AtomicInteger activeRoomsCounter = new AtomicInteger(0);
//    private final AtomicInteger totalClientsCounter = new AtomicInteger(0);
//    private final AtomicInteger onlineUsersCounter = new AtomicInteger(0);
//
//    public RealTimeWebRTCMetrics(MeterRegistry meterRegistry, RedisTemplate<String, Object> redisTemplate) {
//        this.meterRegistry = meterRegistry;
//        this.redisTemplate = redisTemplate;
//
//        // Gauge 메트릭 등록 (실시간 값 제공)
//        Gauge.builder("webrtc.rooms.active", activeRoomsCounter, AtomicInteger::get)
//                .description("현재 활성 통화방 수")
//                .register(meterRegistry);
//
//        Gauge.builder("webrtc.clients.total", totalClientsCounter, AtomicInteger::get)
//                .description("현재 전체 참가자 수")
//                .register(meterRegistry);
//
//        Gauge.builder("webrtc.users.online", onlineUsersCounter, AtomicInteger::get)
//                .description("현재 온라인 사용자 수")
//                .register(meterRegistry);
//
//
//        // 서버 시작 시 Redis에서 현재 상태 복원
//        initializeCountersFromRedis();
//    }
//
//    // 서버 재시작 시 Redis 데이터로부터 카운터 복원
//    private void initializeCountersFromRedis() {
//        try {
//            // 활성 방 수 복원
//            Set<String> roomKeys = redisTemplate.keys("room:*");
//            int activeRooms = roomKeys != null ? roomKeys.size() : 0;
//            activeRoomsCounter.set(activeRooms);
//
//            // 전체 참가자 수 복원
//            int totalClients = 0;
//            if (roomKeys != null) {
//                for (String roomKey : roomKeys) {
//                    Long size = redisTemplate.opsForSet().size(roomKey);
//                    totalClients += (size != null ? size.intValue() : 0);
//                }
//            }
//            totalClientsCounter.set(totalClients);
//
//            // 온라인 사용자 수 복원
//            Set<String> userKeys = redisTemplate.keys("user:online:*");
//            int onlineUsers = userKeys != null ? userKeys.size() : 0;
//            onlineUsersCounter.set(onlineUsers);
//
//            //log.info("메트릭 카운터 초기화 완료 - 방:{}, 참가자:{}, 온라인:{}",
//                    activeRooms, totalClients, onlineUsers);
//
//        } catch (Exception e) {
//            //log.error("카운터 초기화 실패", e);
//        }
//    }
//
//    // 방 생성 시 호출
//    public void onRoomCreated(String roomId) {
//        int current = activeRoomsCounter.incrementAndGet();
//        meterRegistry.counter("webrtc.rooms.created.total").increment();
//        //log.debug("방 생성: {} (총 {}개)", roomId, current);
//    }
//
//    // 방 삭제 시 호출
//    public void onRoomDeleted(String roomId) {
//        int current = activeRoomsCounter.decrementAndGet();
//        meterRegistry.counter("webrtc.rooms.deleted.total").increment();
//        //log.debug("방 삭제: {} (총 {}개)", roomId, current);
//    }
//
//    // 사용자 방 입장 시 호출
//    public void onUserJoinedRoom(String roomId, String userId) {
//        int current = totalClientsCounter.incrementAndGet();
//        meterRegistry.counter("webrtc.clients.joined.total").increment();
//        //log.debug("사용자 입장: {} -> {} (총 참가자: {})", userId, roomId, current);
//    }
//
//    // 사용자 방 퇴장 시 호출
//    public void onUserLeftRoom(String roomId, String userId) {
//        int current = totalClientsCounter.decrementAndGet();
//        meterRegistry.counter("webrtc.clients.left.total").increment();
//        //log.debug("사용자 퇴장: {} <- {} (총 참가자: {})", userId, roomId, current);
//    }
//
//    // 사용자 온라인 상태 변경
//    public void onUserOnline(String userId) {
//        int current = onlineUsersCounter.incrementAndGet();
//        //log.debug("사용자 온라인: {} (총 온라인: {})", userId, current);
//    }
//
//    public void onUserOffline(String userId) {
//        int current = onlineUsersCounter.decrementAndGet();
//        //log.debug("사용자 오프라인: {} (총 온라인: {})", userId, current);
//    }
//
//    // 현재 카운터 값들 조회
//    public int getActiveRoomsCount() { return activeRoomsCounter.get(); }
//    public int getTotalClientsCount() { return totalClientsCounter.get(); }
//    public int getOnlineUsersCount() { return onlineUsersCounter.get(); }
//}
package com.clov.backend.common.metrics;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
public class RealTimeWebRTCMetrics {

    private final MeterRegistry meterRegistry;
    private final RedisTemplate<String, Object> redisTemplate;

    // 실시간 카운터들
    private final AtomicInteger activeRoomsCounter = new AtomicInteger(0);
    private final AtomicInteger totalClientsCounter = new AtomicInteger(0);
    private final AtomicInteger onlineUsersCounter = new AtomicInteger(0);

    public RealTimeWebRTCMetrics(MeterRegistry meterRegistry, RedisTemplate<String, Object> redisTemplate) {
        this.meterRegistry = meterRegistry;
        this.redisTemplate = redisTemplate;

        // Gauge 메트릭 등록 (실시간 값 제공)
        Gauge.builder("webrtc.rooms.active", activeRoomsCounter, AtomicInteger::get)
                .description("현재 활성 통화방 수")
                .register(meterRegistry);

        Gauge.builder("webrtc.clients.total", totalClientsCounter, AtomicInteger::get)
                .description("현재 전체 참가자 수")
                .register(meterRegistry);

        Gauge.builder("webrtc.users.online", onlineUsersCounter, AtomicInteger::get)
                .description("현재 온라인 사용자 수")
                .register(meterRegistry);

        // 서버 시작 시 Redis에서 현재 상태 복원
        initializeCountersFromRedis();
    }

    // 🔹 [수정] 서버 재시작 시 Redis 데이터로부터 카운터 복원 - TTL 활성 방만 조회하도록 개선
    private void initializeCountersFromRedis() {
        try {
            // 🔹 [수정] 모든 카운터 초기화
            activeRoomsCounter.set(0);
            totalClientsCounter.set(0);
            onlineUsersCounter.set(0);

            // 🔹 [수정] TTL이 있는 활성 방만 조회 (6자리 영숫자 패턴)
            Set<String> allKeys = redisTemplate.keys("*");
            if (allKeys != null) {
                int activeRooms = 0;
                int totalClients = 0;

                for (String key : allKeys) {
                    // 🔹 [수정] roomCode 패턴 확인 (6자리 영숫자)
                    if (key.matches("^[A-Za-z0-9]{6}$")) {
                        // 🔹 [수정] TTL 확인으로 활성 방인지 검증
                        Long ttl = redisTemplate.getExpire(key);
                        if (ttl != null && ttl > 0) {
                            activeRooms++;

                            // 해당 방의 참가자 수 계산
                            String stateKey = "canvas:" + key + ":state";
                            Long participantCount = redisTemplate.opsForHash().size(stateKey);
                            if (participantCount != null) {
                                totalClients += participantCount.intValue();
                            }
                        }
                    }
                }

                activeRoomsCounter.set(activeRooms);
                totalClientsCounter.set(totalClients);
                // 🔹 [수정] 온라인 사용자는 총 참가자와 동일하게 설정
                onlineUsersCounter.set(totalClients);

                //log.info("메트릭 카운터 초기화 완료 - 활성방:{}, 참가자:{}, 온라인:{}",activeRooms, totalClients, totalClients);
            }

        } catch (Exception e) {
            //log.error("카운터 초기화 실패", e);
            // 🔹 [수정] 실패 시 모든 카운터를 0으로 설정
            activeRoomsCounter.set(0);
            totalClientsCounter.set(0);
            onlineUsersCounter.set(0);
        }
    }

    // 방 생성 시 호출
    public void onRoomCreated(String roomId) {
        int current = activeRoomsCounter.incrementAndGet();
        meterRegistry.counter("webrtc.rooms.created.total").increment();
        //log.debug("방 생성: {} (총 {}개)", roomId, current);
    }

    // 🔹 [수정] 방 삭제 시 호출 - 음수 방지 로직 추가
    public void onRoomDeleted(String roomId) {
        int current = Math.max(0, activeRoomsCounter.decrementAndGet());
        if (activeRoomsCounter.get() < 0) {
            activeRoomsCounter.set(0);
        }
        meterRegistry.counter("webrtc.rooms.deleted.total").increment();
        //log.debug("방 삭제: {} (총 {}개)", roomId, current);
    }

    // 사용자 방 입장 시 호출
    public void onUserJoinedRoom(String roomId, String userId) {
        int current = totalClientsCounter.incrementAndGet();
        meterRegistry.counter("webrtc.clients.joined.total").increment();
        //log.debug("사용자 입장: {} -> {} (총 참가자: {})", userId, roomId, current);
    }

    // 🔹 [수정] 사용자 방 퇴장 시 호출 - 음수 방지 로직 추가
    public void onUserLeftRoom(String roomId, String userId) {
        int current = Math.max(0, totalClientsCounter.decrementAndGet());
        if (totalClientsCounter.get() < 0) {
            totalClientsCounter.set(0);
        }
        meterRegistry.counter("webrtc.clients.left.total").increment();
        //log.debug("사용자 퇴장: {} <- {} (총 참가자: {})", userId, roomId, current);
    }

    // 사용자 온라인 상태 변경
    public void onUserOnline(String userId) {
        int current = onlineUsersCounter.incrementAndGet();
        //log.debug("사용자 온라인: {} (총 온라인: {})", userId, current);
    }

    // 🔹 [수정] 사용자 오프라인 상태 변경 - 음수 방지 로직 추가
    public void onUserOffline(String userId) {
        int current = Math.max(0, onlineUsersCounter.decrementAndGet());
        if (onlineUsersCounter.get() < 0) {
            onlineUsersCounter.set(0);
        }
        //log.debug("사용자 오프라인: {} (총 온라인: {})", userId, current);
    }

    // 현재 카운터 값들 조회
    public int getActiveRoomsCount() { return activeRoomsCounter.get(); }
    public int getTotalClientsCount() { return totalClientsCounter.get(); }
    public int getOnlineUsersCount() { return onlineUsersCounter.get(); }

    // 🔹 [추가] 메트릭 동기화 메서드 (필요시 수동 호출)
    public void syncMetricsWithRedis() {
        //log.info("메트릭 동기화 시작...");
        initializeCountersFromRedis();
    }
}