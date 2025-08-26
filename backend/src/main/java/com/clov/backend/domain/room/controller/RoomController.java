package com.clov.backend.domain.room.controller;

import com.clov.backend.common.response.ApiResponseDto;
import com.clov.backend.common.response.ErrorCode;
import com.clov.backend.common.response.SuccessCode;
import com.clov.backend.domain.background.dto.request.ChangeBackgroundRequest;
import com.clov.backend.domain.background.dto.response.BackgroundResponse;
import com.clov.backend.domain.background.dto.response.UploadBackgroundResponse;
import com.clov.backend.domain.background.service.BackgroundService;
import com.clov.backend.domain.participant.dto.request.ParticipantRequestDto;
import com.clov.backend.domain.participant.dto.response.ParticipantResponseDto;
import com.clov.backend.domain.room.dto.request.RoomCreateRequestDto;
import com.clov.backend.domain.room.dto.request.RoomHostUpdateRequestDto;
import com.clov.backend.domain.room.dto.response.RoomCreateResponseDto;
import com.clov.backend.domain.room.dto.response.RoomLeftResponseDto;
import com.clov.backend.domain.room.dto.response.RoomParticipantResponseDto;
import com.clov.backend.domain.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RedisTemplate<String, String> redisTemplate;
    private final BackgroundService backgroundService;
    private final RoomService roomService;

    @Operation(summary = "방 생성", description = "방을 생성합니다.")
    @PostMapping
    public ApiResponseDto<RoomCreateResponseDto> createRoom(@RequestBody RoomCreateRequestDto roomCreateRequestDto) {
        return ApiResponseDto.success(SuccessCode.ROOM_CREATE_SUCCESS, roomService.createRoom(roomCreateRequestDto));
    }

    @Operation(summary = "방 참여", description = "해당 코드에 맞는 방에 참여합니다.")
    @PostMapping("/{roomCode}/members")
    public ApiResponseDto<ParticipantResponseDto> enterRoom(@PathVariable String roomCode, @RequestBody ParticipantRequestDto participantRequestDto) {
        return ApiResponseDto.success(SuccessCode.ROOM_ENTER_SUCCESS, roomService.enterRoom(roomCode, participantRequestDto));
    }

    @Operation(summary = "방 나가기", description = "해당 코드의 방에서 나갑니다.")
    @DeleteMapping("/{roomCode}/members/{clientId}")
    public ApiResponseDto<RoomLeftResponseDto> leaveRoom(@PathVariable String roomCode, @PathVariable UUID clientId) {
        return ApiResponseDto.success(SuccessCode.ROOM_LEAVE_SUCCESS, roomService.leaveRoom(roomCode, clientId));
    }

    @Operation(summary = "방 참여자 목록 조회", description = "방의 전체 참여자 정보를 반환합니다.")
    @GetMapping("/{roomCode}/members")
    public ApiResponseDto<List<RoomParticipantResponseDto>> getParticipant(@PathVariable String roomCode) {
        return ApiResponseDto.success(SuccessCode.ROOM_PARTICIPANTS_GET_SUCCESS, roomService.getRoomParticipants(roomCode));
    }

    @Operation(summary = "방 배경 교체", description = "roomCode에 해당하는 방의 배경을 변경합니다.")
    @PutMapping("/{roomCode}/canvas/background")
    public ApiResponseDto<Void> changeBackground(
            @PathVariable String roomCode,
            @RequestBody @Validated ChangeBackgroundRequest req) {
        try{
            // 방 존재 여부 검증
            if (!redisTemplate.hasKey(roomCode)) {
                return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
            }
            BackgroundResponse backgroundResponse = backgroundService.changeBackground(roomCode, req);
            return  ApiResponseDto.success(SuccessCode.BACKGROUND_CHANGE_SUCCESS);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        }

    }

    @Operation(summary = "Presigned URL 발급", description = "S3에 업로드할 이미지용 presigned URL을 발급합니다.")
    @PostMapping("/{roomCode}/canvas/background")
    public ApiResponseDto<UploadBackgroundResponse> uploadBackground(
            @PathVariable String roomCode) {
        // Redis Key 정의
        String redisKey = "rate:presign:" + roomCode;

        // 방 존재 여부 검증
        if (!redisTemplate.hasKey(roomCode)) {
            return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        }

        // Presigned URL 요청 카운트 증가
        Long count = redisTemplate.opsForValue().increment(redisKey);

        //redis 연결 실패
        if(count ==null){
            return ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        // 최초 요청이라면 TTL 설정
        if (count == 1) {
            redisTemplate.expire(redisKey, Duration.ofMinutes(1)); // TTL 1분
        }

        // 요청 횟수 초과 시 제한
        if (count > 10) {
            return ApiResponseDto.fail(ErrorCode.TOO_MANY_REQUESTS);
        }

        return ApiResponseDto.success(SuccessCode.UPLOAD_URL_CREATED,backgroundService.createPresignedUrl(roomCode));
    }

    @Operation(summary = "방 유효성 검사", description = "방의 유무 및 만료 여부를 판단합니다.")
    @GetMapping("/{roomCode}")
    public ApiResponseDto checkRoom(@PathVariable String roomCode) {
        roomService.checkRoom(roomCode);
        return ApiResponseDto.success(SuccessCode.ROOM_CHECK_SUCCESS);
    }

    @Operation(summary = "방장 위임", description = "방장 권한을 위임합니다.")
    @PatchMapping("/{roomCode}")
    public ApiResponseDto changeHost(@PathVariable String roomCode, @RequestBody RoomHostUpdateRequestDto roomHostUpdateRequestDto) {
        roomService.changeHost(roomCode, roomHostUpdateRequestDto);
        return ApiResponseDto.success(SuccessCode.ROOM_HOST_CHANGE_SUCCESS);
    }
}
