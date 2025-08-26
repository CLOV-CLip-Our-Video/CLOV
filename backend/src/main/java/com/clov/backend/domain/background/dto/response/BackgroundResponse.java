package com.clov.backend.domain.background.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackgroundResponse {
    private String backgroundUrl;
    private String backgroundTitle;
}