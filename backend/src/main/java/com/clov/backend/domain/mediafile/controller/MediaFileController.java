package com.clov.backend.domain.mediafile.controller;


import com.clov.backend.common.enums.ContentType;
import com.clov.backend.common.exception.CustomException;
import com.clov.backend.common.response.ApiResponseDto;
import com.clov.backend.common.response.ErrorCode;
import com.clov.backend.common.response.SuccessCode;
import com.clov.backend.domain.mediafile.dto.request.MediaFileUploadRequest;
import com.clov.backend.domain.mediafile.dto.request.MediaFileUrlRequest;
import com.clov.backend.domain.mediafile.dto.response.MediaFileURLResponse;
import com.clov.backend.domain.mediafile.service.MediaFileService;
import com.clov.backend.domain.room.entity.Room;
import com.clov.backend.domain.room.repository.RoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

/**
 * 촬영 결과물 업로드 관련 API
 * BASE URL : /api/v1/records
 */
@RestController
@RequestMapping("/api/v1/records")
@RequiredArgsConstructor
@Slf4j
public class MediaFileController {
    private final RedisTemplate<String, String> redisTemplate;
    private final MediaFileService mediaFileService;
    private final RoomRepository roomRepository;
    /* ---------------- presigned URL 발급  --------------- */
    @Operation(summary = "Presigned URL 발급", description = "S3에 업로드할  presigned URL을 발급합니다.")
    @PostMapping()
    public ApiResponseDto<MediaFileURLResponse> makePresignedURL(
            @RequestBody @Validated MediaFileUrlRequest req) {
        String roomCode = req.getRoomCode();
        // Redis Key 정의
        String redisKey = "rate:presign:" + roomCode;


        // 방 존재 여부 검증 (30분 동안 유지됨)
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
        try{
            Room room = roomRepository.findByRoomCode(roomCode)
                    .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
            ContentType contentType = ContentType.valueOf(req.getFileType());

            MediaFileURLResponse data = mediaFileService.createPresignedUrl(room,contentType);
            return ApiResponseDto.success(SuccessCode.UPLOAD_URL_CREATED,data);
        }catch (Exception e){
            return ApiResponseDto.fail(ErrorCode.ROOM_NOT_FOUND);
        }
    }
    @Operation(summary = "업로드 완료 통보", description = "S3 업로드 완료 후 DB에 업로드 결과를 기록합니다.")
    @PostMapping("/upload")
    public ApiResponseDto<Void> uploadComplete(
            @RequestBody @Validated MediaFileUploadRequest request
    ) {
        mediaFileService.confirmUpload(request);
        return ApiResponseDto.success(SuccessCode.MEDIA_UPLOAD_SUCCESS);
    }
}
