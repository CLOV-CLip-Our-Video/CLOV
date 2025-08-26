package com.clov.backend.domain.room.service;

import com.clov.backend.common.enums.RoomStatus;
import com.clov.backend.domain.participant.repository.ParticipantRepository;
import com.clov.backend.domain.participant.service.ParticipantService;
import com.clov.backend.domain.room.dto.request.RoomCreateRequestDto;
import com.clov.backend.domain.room.dto.response.RoomCreateResponseDto;
import com.clov.backend.domain.room.entity.Room;
import com.clov.backend.domain.room.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;
    @Mock
    private RedisTemplate redisTemplate;
    @Mock
    private ValueOperations valueOperations;
    @Mock
    private ParticipantService participantService;
    @Mock
    private ParticipantRepository participantRepository;

    @InjectMocks
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void createRoom_ShouldGenerateRandomRoomCode_AndSetEverythingProperly() {
        // given
        // 1. roomCode는 mock 처리 (랜덤 생성이지만 테스트에서는 임의 값으로)
        String fakeRoomCode = "ZXCVBN";
        // RandomUtil.generateCode()를 mock/stub할 수 없으면,
        // Room 객체가 생성 후 builder로 가져오는 값만 검증
        RoomCreateRequestDto reqDto = mock(RoomCreateRequestDto.class);
        OffsetDateTime now = OffsetDateTime.now();

        // RoomRepository.save가 받은 Room의 값을 그대로 반환하면서 createdAt 세팅
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
            Room roomArg = invocation.getArgument(0);
            roomArg.setCreatedAt(now);
            // 테스트 용이하게, 강제로 roomCode를 덮는다 (build 되는 객체의 값을 예상할 수 있도록)
            roomArg.setRoomCode(fakeRoomCode);
            return roomArg;
        });

        UUID fakeHostId = UUID.randomUUID();
        when(participantService.createParticipantAsHost(eq(fakeRoomCode), any(RoomCreateRequestDto.class))).thenReturn(fakeHostId);

        // when
        RoomCreateResponseDto result = roomService.createRoom(reqDto);

        // then
        verify(roomRepository).save(any(Room.class));
        // Redis 저장 확인 (roomCode는 fakeRoomCode 값)
        verify(valueOperations).set(
                eq(fakeRoomCode),
                eq("active"),
                eq(Duration.ofSeconds(60 * 30))
        );
        verify(participantService).createParticipantAsHost(eq(fakeRoomCode), eq(reqDto));

        assertThat(result.getRoomCode()).isEqualTo(fakeRoomCode);
        assertThat(result.getHostId()).isEqualTo(fakeHostId);
        assertThat(result.getJoinUrl()).isEqualTo("https://clov.app/" + fakeRoomCode);
        assertThat(result.getCreatedAt()).isEqualTo(now);
    }
}