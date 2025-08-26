package com.clov.backend.domain.background.service;

import com.clov.backend.common.redis.repository.RedisRepository;
import com.clov.backend.domain.background.dto.request.ChangeBackgroundRequest;
import com.clov.backend.domain.background.dto.request.UploadBackgroundRequest;
import com.clov.backend.domain.background.dto.response.BackgroundListResponse;
import com.clov.backend.domain.background.dto.response.BackgroundResponse;
import com.clov.backend.domain.background.dto.response.UploadBackgroundResponse;
import com.clov.backend.domain.background.entity.Background;
import com.clov.backend.domain.background.repository.BackgroundRepository;
import com.clov.backend.domain.canvas.dto.CanvasStateDto;
import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.stream.Collectors;


@RequiredArgsConstructor
@Service
@Slf4j
public class BackgroundService{

    private final RedisRepository redisRepository;
    private final BackgroundRepository backgroundRepository;
    private final S3Presigner presigner;          // v2 Presigner
    /** S3 기본 경로는 설정 파일로 분리 */
    @Value("${cloud.aws.s3.background-base-url}")   // 예) https://my-bucket.s3.ap-northeast-2.amazonaws.com/
    private String baseUrl;  //s3서버 url
    @Value("${cloud.aws.s3.bucket}")
    private String bucket; //버킷이름
    /**
     * 전체 배경 목록을 DTO로 반환
     */

    @Transactional(readOnly = true)
    public BackgroundListResponse getBackgrounds() {
        var dtoList = backgroundRepository.findAll().stream()
                .map(bg -> BackgroundListResponse.BackgroundResponseDTO.builder()
                        .backgroundId(Math.toIntExact(bg.getBackgroundId()))
                        .backgroundTitle(bg.getBackgroundTitle())
                        .backgroundUrl(bg.getBackgroundUrl())
                        .build())
                .collect(Collectors.toList());

        return BackgroundListResponse.builder()
                .backgrounds(dtoList)
                .build();
    }


    /**
     * 방에서 교체할 배경 URL 반환
     *
     * @param roomCode  방 코드
     * @param request   { backgroundId }
     * @return          최종 배경 URL
     */

    @Transactional(readOnly = true)
    public BackgroundResponse changeBackground(String roomCode, ChangeBackgroundRequest request) {
        String backgroundUrl = null;
        String backgroundTitle = null;
        // 커스텀 배경(= -1) → roomCode 디렉터리 사용
        if (request.getBackgroundId() == -1) {
            String customUrl = String.format("%sbackgrounds/%s.png", ensureSlash(baseUrl), roomCode);
            //log.debug("커스텀 배경 사용: {}", customUrl);
            backgroundUrl = customUrl;
            backgroundTitle = roomCode + "Custom";
        }
        else{
            // 공통 배경 → DB 조회
            Background bg = backgroundRepository.findById(request.getBackgroundId().longValue())
                    .orElseThrow(() -> new IllegalArgumentException("배경이 존재하지 않습니다."));

            String commonUrl = String.format("%sbackgrounds/%d.png", ensureSlash(baseUrl), bg.getBackgroundId());
            //log.debug("배경 교체: {} -> {}", bg.getBackgroundTitle(), commonUrl);
            backgroundUrl = commonUrl;
            backgroundTitle = bg.getBackgroundTitle();
        }

        //redis 업데이트 roomcode , backgroundResponse.Title, backgroundResponse.Url
        try{

            redisRepository.saveBackground(roomCode,new CanvasStateDto.BackgroundDto(backgroundUrl,backgroundTitle));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return BackgroundResponse.builder().backgroundTitle(backgroundTitle).backgroundUrl(backgroundUrl).build();
    }

    /**
     * S3 등에 업로드할 presigned URL 발급
     *
     * @param  {roomCode}
     * @return presignedURL
     */

    public UploadBackgroundResponse createPresignedUrl(String roomCode) {

        String key = "backgrounds/%s.png".formatted(
                roomCode);

        // 1) 업로드용 PutObjectRequest
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType("image/png")
                .build();

        // 2) 서명 만료 시간 설정
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(9))
                .putObjectRequest(objectRequest)
                .build();

        // 3) presigned URL 생성
        String presignedUrl = presigner.presignPutObject(presignRequest)
                .url()
                .toString();

        //log.debug("Presigned URL 생성: {}", presignedUrl);

        return UploadBackgroundResponse.builder()
                .presignedUrl(presignedUrl)
                .build();
    }

    /** baseUrl에 끝 슬래시가 없을 때 하나 붙여줌 */
    private String ensureSlash(String url) {
        return url.endsWith("/") ? url : url + "/";
    }
}
