package com.clov.backend.common.redis.repository;

import com.clov.backend.common.redis.repository.RedisRepository;
import com.clov.backend.domain.canvas.dto.CanvasStateDto;
import com.clov.backend.domain.canvas.dto.response.FullCanvasStateResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest
@DisplayName("Redis 상태 저장 및 조회 통합 테스트")
class RedisRepositoryTest {

    @Autowired
    private RedisRepository redisRepository;

    private final String roomCode = "testRoom";
    private final UUID hostId = UUID.randomUUID();
    private final UUID clientId = UUID.randomUUID();

    @BeforeEach
    void setupRoom() {
        CanvasStateDto.BackgroundDto bgDto = CanvasStateDto.BackgroundDto.builder()
                .backgroundUrl("https://example.com/image.png")
                .backgroundTitle("테스트배경")
                .build();

        redisRepository.saveHost(roomCode, hostId);
        redisRepository.saveNickname(roomCode, hostId, "방장님");
        redisRepository.saveCanvasState(roomCode, hostId, new CanvasStateDto(100, 200, 1.0, 1.0));
        redisRepository.saveBackground(roomCode, bgDto);
        redisRepository.setRoomTTL(roomCode, 1800);
    }

    @AfterEach
    void cleanup() {
        redisRepository.deleteRoom(roomCode);
    }

    @Test
    @DisplayName("방장 저장 및 조회 테스트")
    void saveAndGetHostTest() {
        Optional<String> host = redisRepository.getHost(roomCode);
        assertThat(host).isPresent().contains(hostId.toString());
    }

    @Test
    @DisplayName("isHost로 호스트 여부 판단")
    void isHostTest() {
        assertThat(redisRepository.isHost(roomCode, hostId)).isTrue();
        assertThat(redisRepository.isHost(roomCode, clientId)).isFalse();
    }

    @Test
    @DisplayName("참여자 닉네임 및 상태 저장 후 전체 조회")
    void participantJoinTest() {
        redisRepository.saveNickname(roomCode, clientId, "참여자1"); 
        
        String nickname = redisRepository.getNickname(roomCode, clientId);
        assertThat(nickname).contains("참여자1");
    }

    @Test
    @DisplayName("전체 캔버스 상태 조회 테스트")
    void getFullCanvasStateTest() {
        redisRepository.saveCanvasState(roomCode, clientId, new CanvasStateDto(150, 250, 0.8, 0.9));

        FullCanvasStateResponse response = redisRepository.getCanvasState(roomCode);
        assertThat(response.getParticipants()).hasSize(2);
    }
}
