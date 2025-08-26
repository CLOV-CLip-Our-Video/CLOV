package com.clov.backend.domain.canvas.dto;

import lombok.*;
import java.io.Serializable;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanvasStateDto implements Serializable{

    private Integer x;
    private Integer y;
    private Double scale;
    private Double opacity;
    private Integer mode;       // 기본, 누끼 제거 같은 모드 설정
    private String filter;      // 필터
    private Integer rotation; // 회전 값(기본값은 0)
    private Boolean isMicOn;   // 마이크 on/off 상태
    private String overlay;  //오버레이

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BackgroundDto implements Serializable {
        private String backgroundUrl;
        private String backgroundTitle;
    }
}