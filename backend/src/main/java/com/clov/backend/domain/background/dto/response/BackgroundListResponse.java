package com.clov.backend.domain.background.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackgroundListResponse {
    private List<BackgroundResponseDTO> backgrounds;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BackgroundResponseDTO {
        private Integer backgroundId;
        private String backgroundTitle;
        private String backgroundUrl;
    }
}