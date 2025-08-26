package com.clov.backend.domain.mediafile.dto.request;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaFileUploadRequest {
    private Long mediaFileId;
    private String roomCode;
    private String fileUrl;
    private OffsetDateTime createdAt;
    private String contentType;

}
