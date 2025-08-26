package com.clov.backend.domain.mediafile.dto.request;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaFileUrlRequest {
    String roomCode;
    String fileType;
}
