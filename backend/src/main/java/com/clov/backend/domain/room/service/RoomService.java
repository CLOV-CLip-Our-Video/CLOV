package com.clov.backend.domain.room.service;

import com.clov.backend.common.enums.RoomStatus;
import com.clov.backend.common.exception.CustomException;
import com.clov.backend.common.metrics.RealTimeWebRTCMetrics;
import com.clov.backend.common.metrics.RoomDistributionMetrics;
import com.clov.backend.common.redis.repository.RedisRepository;
import com.clov.backend.common.response.ErrorCode;
import com.clov.backend.common.util.RandomUtil;
import com.clov.backend.domain.background.entity.Background;
import com.clov.backend.domain.background.repository.BackgroundRepository;
import com.clov.backend.domain.canvas.dto.CanvasStateDto;
import com.clov.backend.domain.participant.dto.request.ParticipantRequestDto;
import com.clov.backend.domain.participant.dto.response.ParticipantResponseDto;
import com.clov.backend.domain.participant.entity.Participant;
import com.clov.backend.domain.participant.repository.ParticipantRepository;
import com.clov.backend.domain.participant.service.ParticipantService;
import com.clov.backend.domain.room.dto.request.RoomCreateRequestDto;
import com.clov.backend.domain.room.dto.request.RoomHostUpdateRequestDto;
import com.clov.backend.domain.room.dto.response.RoomCreateResponseDto;
import com.clov.backend.domain.room.dto.response.RoomLeftResponseDto;
import com.clov.backend.domain.room.dto.response.RoomParticipantResponseDto;
import com.clov.backend.domain.room.entity.Room;
import com.clov.backend.domain.room.repository.RoomRepository;
import com.vane.badwordfiltering.BadWordFiltering;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RoomService {

    private static final String SITE_URL = "https://clov.co.kr/";
    private static final int MAX_PARTICIPANTS = 10;

    private final RealTimeWebRTCMetrics realTimeMetrics;
    private final RoomDistributionMetrics distributionMetrics;
    private final RoomRepository roomRepository;
    private final RedisRepository redisRepository;
    private final ParticipantService participantService;
    private final ParticipantRepository participantRepository;
    private final BackgroundRepository backgroundRepository;

    public RoomCreateResponseDto createRoom(RoomCreateRequestDto roomCreateRequestDto) {
        BadWordFiltering badWordFiltering = new BadWordFiltering();
        ClassPathResource resource = new ClassPathResource("badwords.txt");
        try (InputStream inputStream = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))){

           List<String> words = reader.lines()
                   .flatMap(line -> Arrays.stream(line.split(",")))
                   .map(String::trim)
                   .filter(word -> !word.isEmpty())
                   .collect(Collectors.toList());

           badWordFiltering.addAll(words);

        } catch (IOException e){
            e.printStackTrace();
        }

        if(badWordFiltering.check(roomCreateRequestDto.getNickname())) {
            throw new CustomException(ErrorCode.BAD_WORD_NICKNAME);
        }

        Room room = Room.builder()
                .roomCode(RandomUtil.generateCode())
                .status(RoomStatus.OPEN)
                .createdAt(OffsetDateTime.now())
                .build();
        roomRepository.save(room);

        //방 코드의 유효시간 설정
        long expireSeconds = 60 * 60; //1시간으로 일시 수정

        UUID hostId = participantService.createParticipantAsHost(room.getRoomCode(), roomCreateRequestDto);

        // 초기 캔버스 상태 준비
        CanvasStateDto initialState = CanvasStateDto.builder()
                .x(200)
                .y(100)
                .scale(1D)
                .opacity(1D)
                .build();
//        //redis에 RoomTTL 설정
//        redisRepository.setRoomTTL(room.getRoomCode(), expireSeconds);
//
//        //redis에 hostId 저장
//        redisRepository.saveHost(room.getRoomCode(), hostId);
//
//        //redis에 닉네임 저장
//        redisRepository.saveNickname(room.getRoomCode(), hostId, roomCreateRequestDto.getNickname());
//
//        //redis에 state 저장
//        redisRepository.saveCanvasState(room.getRoomCode(), hostId, CanvasStateDto.builder()
//                .x(200)
//                .y(100)
//                .scale(1D)
//                .opacity(1D)
//                .build());

        // 배경 정보 준비
        Background background = backgroundRepository.findById(1L)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
        CanvasStateDto.BackgroundDto backgroundDto = CanvasStateDto.BackgroundDto.builder()
                .backgroundUrl(background.getBackgroundUrl())
                .backgroundTitle(background.getBackgroundTitle())
                .build();
//        //redis에 background 저장
//        redisRepository.saveBackground(room.getRoomCode(), CanvasStateDto.BackgroundDto.builder()
//                .backgroundUrl(background.getBackgroundUrl())
//                .backgroundTitle(background.getBackgroundTitle())
//                .build());

        // 🔹 배치 처리로 Redis 작업 한 번에 수행
//        long expireSeconds = 60 * 30; // 30분
        redisRepository.batchCreateRoom(
                room.getRoomCode(),
                hostId,
                roomCreateRequestDto.getNickname(),
                initialState,
                backgroundDto,
                expireSeconds
        );

        //metrics 생성
        realTimeMetrics.onRoomCreated(room.getRoomCode());
        realTimeMetrics.onUserJoinedRoom(room.getRoomCode(), hostId.toString());
        realTimeMetrics.onUserOnline(hostId.toString()); // 🔹 [추가] 온라인 사용자 추가
        distributionMetrics.onRoomParticipantCountChanged(room.getRoomCode(), 0, 1);

        log.info("방 생성 완료: roomCode={}, hostId={}, 현재 활성방={}, 총참가자={}, 온라인={}",
                room.getRoomCode(), hostId,
                realTimeMetrics.getActiveRoomsCount(), realTimeMetrics.getTotalClientsCount(),
                realTimeMetrics.getOnlineUsersCount()); // 🔹 [추가] 온라인 사용자 수

        return RoomCreateResponseDto.builder()
                .roomCode(room.getRoomCode())
                .joinUrl(SITE_URL + "room/" + room.getRoomCode())
                .hostId(hostId)
                .createdAt(room.getCreatedAt())
                .isHost(true)
                .build();
    }

    public ParticipantResponseDto enterRoom(String roomCode, ParticipantRequestDto participantRequestDto) {
        //방 코드 만료 시 입장 불가
        if (!redisRepository.existsRoom(roomCode)) {
            throw new CustomException(ErrorCode.ROOM_CODE_EXPIRED);
        }
        int participantCountBefore = redisRepository.getParticipantCount(roomCode);
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
        UUID clientId = participantService.createParticipant(roomCode, participantRequestDto);

        //방 인원 체크
        if (participantCountBefore >= MAX_PARTICIPANTS) {
            throw new CustomException(ErrorCode.MAX_PARTICIPANTS);
        }

        BadWordFiltering badWordFiltering = new BadWordFiltering();
        ClassPathResource resource = new ClassPathResource("badwords.txt");
        try (InputStream inputStream = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))){

            List<String> words = reader.lines()
                    .flatMap(line -> Arrays.stream(line.split(",")))
                    .map(String::trim)
                    .filter(word -> !word.isEmpty())
                    .collect(Collectors.toList());

            badWordFiltering.addAll(words);

        } catch (IOException e){
            e.printStackTrace();
        }

        if(badWordFiltering.check(participantRequestDto.getNickname())) {
            throw new CustomException(ErrorCode.BAD_WORD_NICKNAME);
        }
//        //redis에 닉네임 저장
//        redisRepository.saveNickname(room.getRoomCode(), clientId, participantRequestDto.getNickname());
//
//        //redis에 state 저장
//        redisRepository.saveCanvasState(room.getRoomCode(), clientId, CanvasStateDto.builder()
//                .x(200)
//                .y(100)
//                .scale(1D)
//                .opacity(1D)
//                .build());

        // 초기 캔버스 상태 준비
        CanvasStateDto initialState = CanvasStateDto.builder()
                .x(200)
                .y(100)
                .scale(1D)
                .opacity(1D)
                .build();

        // 배치 처리로 Redis 작업 한 번에 수행
        redisRepository.batchEnterRoom(
                roomCode,
                clientId,
                participantRequestDto.getNickname(),
                initialState
        );

        //방 참가입장 - metric 업데이트
        realTimeMetrics.onUserJoinedRoom(roomCode, clientId.toString());
        realTimeMetrics.onUserOnline(clientId.toString()); // 🔹 [추가] 온라인 사용자 추가

        // 🔹 [수정] 실제 참가자 수 다시 확인 (Redis 기준)
        int participantCountAfter = redisRepository.getParticipantCount(roomCode);
        log.info("방 입장 완료: roomCode={}, clientId={}, 참가자수 {}->={}, 총참가자={}, 온라인={}",
                roomCode, clientId, participantCountBefore, participantCountAfter,
                realTimeMetrics.getTotalClientsCount(), realTimeMetrics.getOnlineUsersCount());

        distributionMetrics.onRoomParticipantCountChanged(roomCode, participantCountBefore, participantCountAfter);

        return ParticipantResponseDto.builder()
                .roomCode(roomCode)
                .clientId(clientId)
                .joinedAt(OffsetDateTime.now())
                .isHost(false)
                .build();
    }

    public RoomLeftResponseDto leaveRoom(String roomCode, UUID clientId) {
        Participant participant = participantRepository.findByClientId(clientId);
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));

        // 🔹 [수정] Redis에서 현재 참가자 수 정확히 조회
        int participantCountBefore = redisRepository.getParticipantCount(roomCode);

        if (participant.getIsHost()) {
            // 🔹 [수정] Redis에 있던 모든 참가자들의 퇴장 처리를 먼저
            List<String> participants = redisRepository.getParticipants(roomCode);
            for (String participantId : participants) {
                realTimeMetrics.onUserLeftRoom(roomCode, participantId);
                realTimeMetrics.onUserOffline(participantId); // 🔹 [추가] 오프라인 처리
            }

            //호스트가 나가는 경우 방 관련 Redis 데이터 제거
            redisRepository.deleteRoom(roomCode);
            //방 폐쇄
            room.setStatus(RoomStatus.CLOSED);

            // closed at 갱신
            room.setClosedAt(OffsetDateTime.now());

            realTimeMetrics.onRoomDeleted(roomCode);
            // 🔹 분포 메트릭 업데이트: 모든 참가자 퇴장으로 방 소멸
            distributionMetrics.onRoomParticipantCountChanged(roomCode, participantCountBefore, 0);

            // 🔹 [수정] 로그에 온라인 사용자 수 추가
            //log.info("방 폐쇄 완료: roomCode={}, 퇴장참가자수={}, 현재 활성방={}, 총참가자={}, 온라인={}",
            //        roomCode, participantCountBefore,
           //         realTimeMetrics.getActiveRoomsCount(), realTimeMetrics.getTotalClientsCount(),
           //         realTimeMetrics.getOnlineUsersCount()); // 🔹 [추가] 온라인 사용자 수

        } else {
            //일반 참여자의 경우 해당 참가자의 state 삭제
            redisRepository.deleteCanvasState(roomCode, clientId);

            // 🔹 메트릭 업데이트: 일반 참가자 퇴장
            realTimeMetrics.onUserLeftRoom(roomCode, clientId.toString());
            realTimeMetrics.onUserOffline(clientId.toString()); // 🔹 [추가] 오프라인 처리

            // 🔹 분포 메트릭 업데이트: 1명 감소
            distributionMetrics.onRoomParticipantCountChanged(roomCode, participantCountBefore, participantCountBefore - 1);

            // 🔹 [수정] 로그에 온라인 사용자 수 추가
            //log.info("참가자 퇴장 완료: roomCode={}, clientId={}, 참가자수 {}->={}, 총참가자={}, 온라인={}",
             //       roomCode, clientId, participantCountBefore, participantCountBefore - 1,
             //       realTimeMetrics.getTotalClientsCount(), realTimeMetrics.getOnlineUsersCount());
        }
        OffsetDateTime leftAt = OffsetDateTime.now();
        participant.updateLeftAt(leftAt);
        return RoomLeftResponseDto.builder()
                .clientId(clientId)
                .leftAt(leftAt)
                .build();
    }

    public List<RoomParticipantResponseDto> getRoomParticipants(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
        List<Participant> participantList = participantRepository.findByRoom(room);

        return participantList.stream()
                .map(participant -> RoomParticipantResponseDto.builder()
                        .clientId(participant.getClientId())
                        .nickname(redisRepository.getNickname(roomCode, participant.getClientId()))
                        .isHost(participant.getIsHost())
                        .build()
                ).collect(Collectors.toList());
    }

    public void checkRoom(String roomCode) {
        //방 코드 만료 여부 검사
        if (!redisRepository.existsRoom(roomCode)) {
            throw new CustomException(ErrorCode.ROOM_NOT_FOUND);
        }
        //해당 코드를 가진 방이 있는지 검사
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
        //방 상태가 닫혀있는 지 검사
        if (room.getStatus().equals(RoomStatus.CLOSED)) {
            throw new CustomException(ErrorCode.ROOM_NOT_FOUND);
        }
    }

    public void changeHost(String roomCode, RoomHostUpdateRequestDto roomHostUpdateRequestDto) {
        //기존 Host의 권한 검사
        Participant hostParticipant = participantRepository.findByClientId(roomHostUpdateRequestDto.getPreviousHostId());
        if(!hostParticipant.getIsHost()) {
            throw new CustomException(ErrorCode.NOT_HOST);
        }

        //기존 Host 권한 삭제
        hostParticipant.setIsHost(false);
        participantRepository.save(hostParticipant);

        //새로운 Host로 변경
        Participant participant = participantRepository.findByClientId(roomHostUpdateRequestDto.getNewHostId());
        participant.setIsHost(true);
        participantRepository.save(participant);
        redisRepository.saveHost(roomCode, participant.getClientId());
    }
}
