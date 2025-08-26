package com.clov.backend.domain.mediafile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaFileURLResponse {
    private String presignedUrl;
    private Long mediaFileId;
}