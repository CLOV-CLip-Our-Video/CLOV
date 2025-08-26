package com.clov.backend.domain.background.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * AI 배경 이미지 생성 요청 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIGenerateRequest {
    
    private String prompt;
    private Integer width;
    private Integer height;
    
    @Override
    public String toString() {
        return "AIGenerateRequest{" +
                "prompt='" + prompt + '\'' +
                ", width=" + width +
                ", height=" + height +
                '}';
    }
}