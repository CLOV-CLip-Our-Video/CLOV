//package com.clov.backend.common.metrics;
//
//import io.micrometer.core.instrument.Gauge;
//import io.micrometer.core.instrument.MeterRegistry;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.stereotype.Component;
//
//import java.util.HashMap;
//import java.util.Map;
//import java.util.Set;
//import java.util.concurrent.ConcurrentHashMap;
//import java.util.concurrent.atomic.AtomicInteger;
//
//@Slf4j
//@Component
//public class RoomDistributionMetrics {
//
//    private final MeterRegistry meterRegistry;
//    private final RedisTemplate<String, Object> redisTemplate;
//
//    // 인원수별 방 개수 카운터 (1명~10명, 10명 이상)
//    private final Map<Integer, AtomicInteger> roomsByParticipantCount = new ConcurrentHashMap<>();
//    private final AtomicInteger roomsWithMoreThan10 = new AtomicInteger(0);
//
//    public RoomDistributionMetrics(MeterRegistry meterRegistry, RedisTemplate<String, Object> redisTemplate) {
//        this.meterRegistry = meterRegistry;
//        this.redisTemplate = redisTemplate;
//
//        // 1명~10명 방 메트릭 등록
//        for (int i = 1; i <= 10; i++) {
//            AtomicInteger counter = new AtomicInteger(0);
//            roomsByParticipantCount.put(i, counter);
//
//            final int participantCount = i; // final for lambda
//            Gauge.builder("webrtc.rooms.by_participants", counter, AtomicInteger::get)
//                    .tag("participant_count", String.valueOf(participantCount))
//                    .description("참가자 수별 방 개수")
//                    .register(meterRegistry);
//        }
//
//        // 10명 이상 방 메트릭
//        Gauge.builder("webrtc.rooms.by_participants", roomsWithMoreThan10, AtomicInteger::get)
//                .tag("participant_count", "10+")
//                .description("10명 이상 참가자 방 개수")
//                .register(meterRegistry);
//
//        // 서버 시작 시 Redis에서 현재 분포 복원
//        initializeDistributionFromRedis();
//    }
//
//    private void initializeDistributionFromRedis() {
//        try {
//            // 모든 카운터 초기화
//            roomsByParticipantCount.values().forEach(counter -> counter.set(0));
//            roomsWithMoreThan10.set(0);
//
//            Set<String> roomKeys = redisTemplate.keys("room:*");
//            if (roomKeys != null) {
//                for (String roomKey : roomKeys) {
//                    Long participantCount = redisTemplate.opsForSet().size(roomKey);
//                    if (participantCount != null) {
//                        updateRoomDistribution(participantCount.intValue(), 1);
//                    }
//                }
//            }
//
//            //log.info("방 분포 메트릭 초기화 완료: {}", getCurrentDistribution());
//
//        } catch (Exception e) {
//            //log.error("방 분포 메트릭 초기화 실패", e);
//        }
//    }
//
//    // 방의 참가자 수가 변경될 때 호출
//    public void onRoomParticipantCountChanged(String roomId, int oldCount, int newCount) {
//        // 이전 카운트에서 제거
//        if (oldCount > 0) {
//            updateRoomDistribution(oldCount, -1);
//        }
//
//        // 새로운 카운트에 추가
//        if (newCount > 0) {
//            updateRoomDistribution(newCount, 1);
//        }
//
//        //log.debug("방 {} 참가자 수 변경: {} -> {} | 현재 분포: {}",
//                roomId, oldCount, newCount, getCurrentDistribution());
//    }
//
//    private void updateRoomDistribution(int participantCount, int delta) {
//        if (participantCount <= 10) {
//            AtomicInteger counter = roomsByParticipantCount.get(participantCount);
//            if (counter != null) {
//                counter.addAndGet(delta);
//            }
//        } else {
//            roomsWithMoreThan10.addAndGet(delta);
//        }
//    }
//
//    // 현재 분포 상태 조회 (로깅/디버깅용)
//    public Map<String, Integer> getCurrentDistribution() {
//        Map<String, Integer> distribution = new HashMap<>();
//
//        for (int i = 1; i <= 10; i++) {
//            AtomicInteger counter = roomsByParticipantCount.get(i);
//            if (counter != null && counter.get() > 0) {
//                distribution.put(i + "명", counter.get());
//            }
//        }
//
//        if (roomsWithMoreThan10.get() > 0) {
//            distribution.put("10+명", roomsWithMoreThan10.get());
//        }
//
//        return distribution;
//    }
//
//    // 총 방 수 계산
//    public int getTotalRoomsFromDistribution() {
//        int total = roomsByParticipantCount.values().stream()
//                .mapToInt(AtomicInteger::get)
//                .sum();
//        return total + roomsWithMoreThan10.get();
//    }
//}
package com.clov.backend.common.metrics;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
public class RoomDistributionMetrics {

    private final MeterRegistry meterRegistry;
    private final RedisTemplate<String, Object> redisTemplate;

    // 🔹 [수정] 인원수별 방 개수 카운터 (1명~6명, 6명 이상) - 최대 6명으로 변경
    private final Map<Integer, AtomicInteger> roomsByParticipantCount = new ConcurrentHashMap<>();
    private final AtomicInteger roomsWithMoreThan6 = new AtomicInteger(0);

    public RoomDistributionMetrics(MeterRegistry meterRegistry, RedisTemplate<String, Object> redisTemplate) {
        this.meterRegistry = meterRegistry;
        this.redisTemplate = redisTemplate;

        // 🔹 [수정] 1명~6명 방 메트릭 등록 - 최대 6명으로 변경
        for (int i = 1; i <= 6; i++) {
            AtomicInteger counter = new AtomicInteger(0);
            roomsByParticipantCount.put(i, counter);

            final int participantCount = i; // final for lambda
            Gauge.builder("webrtc.rooms.by_participants", counter, AtomicInteger::get)
                    .tag("participant_count", String.valueOf(participantCount))
                    .description("참가자 수별 현재 활성 방 개수")
                    .register(meterRegistry);
        }

        // 🔹 [수정] 6명 이상 방 메트릭 - 최대 6명으로 변경 (실제로는 사용되지 않음)
        Gauge.builder("webrtc.rooms.by_participants", roomsWithMoreThan6, AtomicInteger::get)
                .tag("participant_count", "6+")
                .description("6명 이상 참가자 현재 활성 방 개수")
                .register(meterRegistry);

        // 서버 시작 시 Redis에서 현재 분포 복원
        initializeDistributionFromRedis();
    }

    // 🔹 [수정] Redis에서 분포 초기화 - TTL 활성 방만 조회하도록 개선
    private void initializeDistributionFromRedis() {
        try {
            // 🔹 [수정] 모든 카운터 초기화
            roomsByParticipantCount.values().forEach(counter -> counter.set(0));
            roomsWithMoreThan6.set(0);

            // 🔹 [수정] TTL이 있는 활성 방만 조회
            Set<String> allKeys = redisTemplate.keys("*");
            if (allKeys != null) {
                for (String key : allKeys) {
                    // 🔹 [수정] roomCode 패턴 확인 (6자리 영숫자)
                    if (key.matches("^[A-Za-z0-9]{6}$")) {
                        // 🔹 [수정] TTL 확인으로 활성 방인지 검증
                        Long ttl = redisTemplate.getExpire(key);
                        if (ttl != null && ttl > 0) {
                            // 해당 방의 참가자 수 계산
                            String stateKey = "canvas:" + key + ":state";
                            Long participantCount = redisTemplate.opsForHash().size(stateKey);
                            if (participantCount != null && participantCount > 0) {
                                updateRoomDistribution(participantCount.intValue(), 1);
                            }
                        }
                    }
                }
            }

            //log.info("방 분포 메트릭 초기화 완료: {}", getCurrentDistribution());

        } catch (Exception e) {
            //log.error("방 분포 메트릭 초기화 실패", e);
            // 🔹 [수정] 실패 시 모든 카운터를 0으로 설정
            roomsByParticipantCount.values().forEach(counter -> counter.set(0));
            roomsWithMoreThan6.set(0);
        }
    }

    // 방의 참가자 수가 변경될 때 호출
    public void onRoomParticipantCountChanged(String roomId, int oldCount, int newCount) {
        // 이전 카운트에서 제거
        if (oldCount > 0) {
            updateRoomDistribution(oldCount, -1);
        }

        // 새로운 카운트에 추가
        if (newCount > 0) {
            updateRoomDistribution(newCount, 1);
        }

        //log.debug("방 {} 참가자 수 변경: {} -> {} | 현재 분포: {}",roomId, oldCount, newCount, getCurrentDistribution());
}

    // 🔹 [수정] 방 분포 업데이트 - 음수 방지 로직 추가, 최대 6명으로 변경
    private void updateRoomDistribution(int participantCount, int delta) {
        if (participantCount <= 0) {
            return; // 🔹 [추가] 0명 이하는 처리하지 않음
        }

        if (participantCount <= 6) { // 🔹 [수정] 6명 이하로 변경
            AtomicInteger counter = roomsByParticipantCount.get(participantCount);
            if (counter != null) {
                int newValue = Math.max(0, counter.addAndGet(delta));
                if (newValue < 0) {
                    counter.set(0); // 🔹 [추가] 음수 방지
                }
            }
        } else {
            int newValue = Math.max(0, roomsWithMoreThan6.addAndGet(delta)); // 🔹 [수정] 6명 초과로 변경
            if (newValue < 0) {
                roomsWithMoreThan6.set(0); // 🔹 [추가] 음수 방지
            }
        }
    }

    // 🔹 [수정] 현재 분포 상태 조회 - 최대 6명으로 변경
    public Map<String, Integer> getCurrentDistribution() {
        Map<String, Integer> distribution = new HashMap<>();

        for (int i = 1; i <= 6; i++) { // 🔹 [수정] 6명까지로 변경
            AtomicInteger counter = roomsByParticipantCount.get(i);
            if (counter != null && counter.get() > 0) {
                distribution.put(i + "명", counter.get());
            }
        }

        if (roomsWithMoreThan6.get() > 0) { // 🔹 [수정] 6명 초과로 변경
            distribution.put("6+명", roomsWithMoreThan6.get());
        }

        return distribution;
    }

    // 🔹 [수정] 총 방 수 계산 - 6명 초과 카운터로 변경
    public int getTotalRoomsFromDistribution() {
        int total = roomsByParticipantCount.values().stream()
                .mapToInt(AtomicInteger::get)
                .sum();
        return total + roomsWithMoreThan6.get(); // 🔹 [수정] 6명 초과로 변경
    }

    // 🔹 [추가] 메트릭 동기화 메서드 (필요시 수동 호출)
    public void syncDistributionWithRedis() {
        //log.info("방 분포 메트릭 동기화 시작...");
        initializeDistributionFromRedis();
    }
}