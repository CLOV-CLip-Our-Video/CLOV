package com.clov.backend.common.redis.repository;


import com.clov.backend.domain.canvas.dto.CanvasStateDto;
import com.clov.backend.domain.canvas.dto.response.FullCanvasStateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.*;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;


@Repository
@RequiredArgsConstructor
public class RedisRepository {

    // Redis와의 연동을 위한 템플릿 객체 주입
    private final RedisTemplate<String, Object> redisTemplate; // 기본 (state, host, TTL, nickname)
    private final RedisTemplate<String, CanvasStateDto.BackgroundDto> backgroundRedisTemplate; // 배경용

    // Redis에 저장되는 Key의 prefix
    private static final String PREFIX = "canvas:";

    /**
     * client 상태 저장 키 생성
     * 예) canvas:ABCD12:state
     */
    private String getStateKey(String roomCode) {
        return PREFIX + roomCode + ":state";
    }

    /**
     * 배경 정보 저장 키 생성
     * 예) canvas:ABCD12:background
     */
    private String getBackgroundKey(String roomCode) {
        return PREFIX + roomCode + ":background";
    }

    /**
     * 호스트 clientId 저장 키 생성
     * 예) canvas:ABCD12:host
     */
    private String getHostKey(String roomCode) {
        return roomCode + ":host";
    }

    /**
     * 닉네임 저장 키 생성
     * 예) ABCD12:nickname
     */
    private String getNicknameKey(String roomCode) {
        return roomCode + ":nickname";
    }

    /**
     * TTL 유지용 roomKey
     */
    private String getRoomTTLKey(String roomCode) {
        return roomCode;
    }

    /**
     * 특정 클라이언트의 캔버스 상태만 Redis에 저장합니다.
     * @param roomCode 방 코드
     * @param clientId 클라이언트 ID
     * @param canvasStateDto 저장할 상태 정보
     */
    public void saveCanvasState(String roomCode, UUID clientId, CanvasStateDto canvasStateDto) {
        HashOperations<String, String, CanvasStateDto> hashOps = redisTemplate.opsForHash();
        hashOps.put(getStateKey(roomCode), clientId.toString(), canvasStateDto);
    }

    /**
     * 특정 클라이언트의 닉네임을 저장합니다.
     * @param roomCode 방 코드
     * @param clientId 클라이언트 ID
     * @param nickname 닉네임
     */
    public void saveNickname(String roomCode, UUID clientId, String nickname) {
        HashOperations<String, String, String> hashOps = redisTemplate.opsForHash();
        hashOps.put(getNicknameKey(roomCode), clientId.toString(), nickname);
    }

    /**
     * 특정 클라이언트의 닉네임을 Redis에서 조회합니다.
     *
     * @param roomCode 방 코드
     * @param clientId 클라이언트 UUID
     * @return 닉네임
     */
    public String getNickname(String roomCode, UUID clientId) {
        HashOperations<String, String, String> hashOps = redisTemplate.opsForHash();
        String nickname = hashOps.get(getNicknameKey(roomCode), clientId.toString());
        return nickname;
    }


    /**
     * 방에 참여 중인 모든 clientId와 닉네임을 Map으로 반환합니다.
     * @param roomCode 방 코드
     * @return clientId → nickname 형태의 Map
     */
    public Map<String, String> getParticipantNicknames(String roomCode) {
        HashOperations<String, String, String> hashOps = redisTemplate.opsForHash();
        return hashOps.entries(getNicknameKey(roomCode));
    }

    /**
     * 전체 캔버스 상태(참가자 상태 + 배경 + 닉네임)를 조합하여 응답용 DTO로 반환합니다.
     * @param roomCode 방 코드
     * @return 전체 캔버스 상태 응답 DTO
     */
    public FullCanvasStateResponse getCanvasState(String roomCode) {
        HashOperations<String, String, CanvasStateDto> stateOps = redisTemplate.opsForHash();
        HashOperations<String, String, String> nicknameOps = redisTemplate.opsForHash();

        Map<String, CanvasStateDto> canvasMap = stateOps.entries(getStateKey(roomCode));
        Map<String, String> nicknameMap = nicknameOps.entries(getNicknameKey(roomCode));

        String hostIdStr = redisTemplate.opsForValue().get(getHostKey(roomCode)).toString();
        UUID hostId = UUID.fromString(hostIdStr);
        List<FullCanvasStateResponse.ParticipantCanvasDTO> participants = canvasMap.entrySet().stream()
                .map(entry -> {
                    UUID id = UUID.fromString(entry.getKey());
                    CanvasStateDto dto = entry.getValue();
                    return FullCanvasStateResponse.ParticipantCanvasDTO.builder()
                            .clientId(id)
                            .x(dto.getX())
                            .y(dto.getY())
                            .scale(dto.getScale())
                            .opacity(dto.getOpacity())
                            .nickname(nicknameMap.get(entry.getKey()))
                            .isHost(id.equals(hostId))
                            .mode(dto.getMode())
                            .filter(dto.getFilter())
                            .rotation(dto.getRotation() != null ? dto.getRotation() : 0)
                            .isMicOn(dto.getIsMicOn() != null ? dto.getIsMicOn() : false)
                            .overlay(dto.getOverlay())
                            .build();
                })
                .toList();

        // 배경 정보 조회
        ValueOperations<String, CanvasStateDto.BackgroundDto> bgOps = backgroundRedisTemplate.opsForValue();
        CanvasStateDto.BackgroundDto bgDto = bgOps.get(getBackgroundKey(roomCode));

        FullCanvasStateResponse.BackgroundInfoDTO background = null;
        if (bgDto != null) {
            background = FullCanvasStateResponse.BackgroundInfoDTO.builder()
                    .backgroundUrl(bgDto.getBackgroundUrl())
                    .backgroundTitle(bgDto.getBackgroundTitle())
                    .build();
        }

        return FullCanvasStateResponse.builder()
                .roomCode(roomCode)
                .background(background)
                .participants(participants)
                .build();
    }

    /**
     * 특정 방에서 특정 클라이언트의 상태 조회
     * @param roomCode 방 코드
     * @param clientId 클라이언트 ID
     * @return Optional<CanvasStateDto>
     */
    public Optional<CanvasStateDto> findCanvasState(String roomCode, UUID clientId) {
        HashOperations<String, String, CanvasStateDto> hashOps = redisTemplate.opsForHash();
        return Optional.ofNullable(hashOps.get(getStateKey(roomCode), clientId.toString()));
    }

    /**
     * 특정 방에서 특정 클라이언트의 상태 삭제
     * @param roomCode 방 코드
     * @param clientId 클라이언트 ID
     */
    public void deleteCanvasState(String roomCode, UUID clientId) {
        redisTemplate.opsForHash().delete(getStateKey(roomCode), clientId.toString());
        redisTemplate.opsForHash().delete(getNicknameKey(roomCode), clientId.toString());
    }

    /**
     * 방의 참가자 상태 전체 삭제 (상태 + 닉네임)
     * @param roomCode 방 코드
     */
    public void deleteAllCanvasStates(String roomCode) {
        redisTemplate.delete(getStateKey(roomCode));
        redisTemplate.delete(getNicknameKey(roomCode));
    }

    /**
     * 방 배경 정보 저장
     * @param roomCode 방 코드
     * @param backgroundDto 저장할 배경 정보
     */
    public void saveBackground(String roomCode, CanvasStateDto.BackgroundDto backgroundDto) {
        backgroundRedisTemplate.opsForValue().set(getBackgroundKey(roomCode), backgroundDto);
    }

    /**
     * 방 배경 정보 삭제
     * @param roomCode 방 코드
     */
    public void deleteBackground(String roomCode) {
        backgroundRedisTemplate.delete(getBackgroundKey(roomCode));
    }

    /**
     * 방 호스트 clientId 저장
     * @param roomCode 방 코드
     * @param clientId 호스트 클라이언트 ID
     */
    public void saveHost(String roomCode, UUID clientId) {
        redisTemplate.opsForValue().set(getHostKey(roomCode), clientId);
    }

    /**
     * 방 호스트 clientId 조회
     * @param roomCode 방 코드
     * @return Optional<String>
     */
    public Optional<String> getHost(String roomCode) {
        return Optional.ofNullable((String) redisTemplate.opsForValue().get(getHostKey(roomCode)));
    }

    /**
     * 방 호스트 정보 삭제
     * @param roomCode 방 코드
     */
    public void deleteHost(String roomCode) {
        redisTemplate.delete(getHostKey(roomCode));
    }

    /**
     * 방 TTL 유지용 키 설정 (ex. 30분)
     * @param roomCode 방 코드
     * @param expireSeconds 유지 시간 (초 단위)
     */
    public void setRoomTTL(String roomCode, long expireSeconds) {
        redisTemplate.opsForValue().set(roomCode, "active", Duration.ofSeconds(expireSeconds));
    }

    /**
     * TTL key 삭제
     * @param roomCode 방 코드
     */
    public void deleteRoomTTL(String roomCode) {
        redisTemplate.delete(getRoomTTLKey(roomCode));
    }

    /**
     * 해당 클라이언트가 방의 호스트인지 여부를 확인합니다.
     *
     * @param roomCode 방 코드
     * @param clientId 클라이언트 ID
     * @return 호스트이면 true, 아니면 false
     */
    public boolean isHost(String roomCode, UUID clientId) {
        return getHost(roomCode)
                .map(hostIdStr -> UUID.fromString(hostIdStr).equals(clientId))
                .orElse(false);
    }

    /**
     * 해당 방에 현재 참여 중인 모든 클라이언트 ID 목록을 조회합니다.
     * (캔버스 상태가 저장된 사용자 기준)
     *
     * @param roomCode 방 코드
     * @return 참여 중인 클라이언트 ID 문자열 리스트
     */
    public List<String> getParticipants(String roomCode) {
        HashOperations<String, String, CanvasStateDto> hashOps = redisTemplate.opsForHash();
        return new ArrayList<>(hashOps.keys(getStateKey(roomCode)));  // UUID.toString() 형태
    }

    /**
     * 해당 방과 관련된 모든 Redis 데이터를 삭제합니다.
     * (참여자 상태, 닉네임, 배경, 호스트 정보, TTL 포함)
     *
     * @param roomCode 방 코드
     */
    public void deleteRoom(String roomCode) {
        deleteAllCanvasStates(roomCode);
        deleteBackground(roomCode);
        deleteHost(roomCode);
        deleteRoomTTL(roomCode);
    }

    /**
     * 해당 방의 코드 만료 여부를 파악합니다.
     *
     * @param roomCode 방 코드
     */
    public boolean existsRoom(String roomCode) {
        return redisTemplate.hasKey(getRoomTTLKey(roomCode));
    }

    /**
     * Redis에 존재하는 모든 방 코드(roomCode)를 조회합니다.
     * canvas:{roomCode}:state 형식의 키에서 roomCode만 추출하여 반환합니다.
     *
     * @return 현재 상태가 저장된 모든 roomCode 목록
     */
    public Set<String> getAllRoomCodes() {
        Set<String> roomCodes = new HashSet<>();

        // Non-blocking 방식으로 개선
        ScanOptions options = ScanOptions.scanOptions()
                .match("canvas:*:state")
                .count(100)
                .build();

        try (Cursor<String> cursor = redisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                String key = cursor.next();
                String roomCode = key.replace("canvas:", "").replace(":state", "");
                roomCodes.add(roomCode);
            }
        }

        return roomCodes;
    }

    /**
     * 특정 방의 현재 참가자 수를 반환합니다.
     * (캔버스 상태가 저장된 사용자 기준)
     *
     * @param roomCode 방 코드
     * @return 현재 참가자 수
     */
    public int getParticipantCount(String roomCode) {
        HashOperations<String, String, CanvasStateDto> hashOps = redisTemplate.opsForHash();
        return hashOps.size(getStateKey(roomCode)).intValue();
    }

    /**
     * 방 생성 시 필요한 모든 Redis 작업을 배치로 처리
     * @param roomCode 방 코드
     * @param hostId 호스트 클라이언트 ID
     * @param nickname 호스트 닉네임
     * @param canvasStateDto 초기 캔버스 상태
     * @param backgroundDto 배경 정보
     * @param expireSeconds TTL 시간
     */
    public void batchCreateRoom(String roomCode, UUID hostId, String nickname,
                                CanvasStateDto canvasStateDto, CanvasStateDto.BackgroundDto backgroundDto,
                                long expireSeconds) {
        // Pipeline을 사용한 배치 처리
        redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            // 1. 호스트 정보 저장
            redisTemplate.opsForValue().set(getHostKey(roomCode), hostId);

            // 2. 닉네임 저장
            redisTemplate.opsForHash().put(getNicknameKey(roomCode), hostId.toString(), nickname);

            // 3. 캔버스 상태 저장
            redisTemplate.opsForHash().put(getStateKey(roomCode), hostId.toString(), canvasStateDto);

            // 4. TTL 설정
            redisTemplate.opsForValue().set(roomCode, "active", Duration.ofSeconds(expireSeconds));

            return null;
        });

        // 배경 정보는 별도 템플릿이므로 따로 처리
        backgroundRedisTemplate.opsForValue().set(getBackgroundKey(roomCode), backgroundDto);
    }

    /**
     * 방 입장 시 필요한 모든 Redis 작업을 배치로 처리
     * @param roomCode 방 코드
     * @param clientId 클라이언트 ID
     * @param nickname 닉네임
     * @param canvasStateDto 초기 캔버스 상태
     */
    public void batchEnterRoom(String roomCode, UUID clientId, String nickname, CanvasStateDto canvasStateDto) {
        // Pipeline을 사용한 배치 처리
        redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            // 1. 닉네임 저장
            redisTemplate.opsForHash().put(getNicknameKey(roomCode), clientId.toString(), nickname);

            // 2. 캔버스 상태 저장
            redisTemplate.opsForHash().put(getStateKey(roomCode), clientId.toString(), canvasStateDto);

            return null;
        });
    }
}
