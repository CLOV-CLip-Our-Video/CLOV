package com.clov.backend.domain.mediafile.service;

import com.clov.backend.common.enums.ContentType;
import com.clov.backend.domain.mediafile.dto.request.MediaFileUploadRequest;
import com.clov.backend.domain.mediafile.dto.response.MediaFileURLResponse;
import com.clov.backend.domain.mediafile.entity.MediaFile;
import com.clov.backend.domain.mediafile.repository.MediaFileRepository;
import com.clov.backend.domain.room.entity.Room;
import com.clov.backend.domain.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;


@RequiredArgsConstructor
@Service
@Slf4j
public class MediaFileService {

    private final MediaFileRepository mediaFileRepository;

    private final S3Presigner presigner;          // v2 Presigner
    /** S3 기본 경로는 설정 파일로 분리 */
    @Value("${cloud.aws.s3.background-base-url}")   // 예) https://my-bucket.s3.ap-northeast-2.amazonaws.com/
    private String baseUrl;  //s3서버 url
    @Value("${cloud.aws.s3.bucket}")
    private String bucket; //버킷이름

    /**
     * S3에 업로드할 presigned URL 발급
     *
     * @param {Room,ContentType}
     * @return presignedURL
     */
    public MediaFileURLResponse createPresignedUrl(Room room, ContentType contentType) {


        //fileID 발급용 placeholder
        MediaFile file = MediaFile.builder()
                .room(room)
                .contentType(contentType)
                .fileUrl("TO_BE_SET") // 초기에는 URL 비움
                .savedAt(OffsetDateTime.now())
                .build();

        mediaFileRepository.save(file);

        String key = "mediaFile/%s.png".formatted(
                file.getFileId());

        // 1) 업로드용 PutObjectRequest
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType("image/png")
                .build();

        // 2) 서명 만료 시간 설정
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(objectRequest)
                .build();

        // 3) presigned URL 생성
        String presignedUrl = presigner.presignPutObject(presignRequest)
                .url()
                .toString();

        //log.debug("Presigned URL 생성: {}", presignedUrl);

        return MediaFileURLResponse.builder()
                .presignedUrl(presignedUrl)
                .mediaFileId(file.getFileId())
                .build();
    }

    /**
     * DB에 file 정보 업데이트
     *
     * @param {MediaFileUploadRequest}
     * @return presignedURL
     */
    @Transactional
    public void confirmUpload(MediaFileUploadRequest request) {
        MediaFile file = mediaFileRepository.findById(request.getMediaFileId())
                .orElseThrow(() -> new IllegalArgumentException("mediaFileId가 존재하지 않습니다."));

        file.setFileUrl(request.getFileUrl());
        file.setSavedAt(request.getCreatedAt());
        file.setContentType(ContentType.valueOf(request.getContentType()));

    }
}
