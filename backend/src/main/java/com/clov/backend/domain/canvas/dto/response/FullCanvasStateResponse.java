package com.clov.backend.domain.canvas.dto.response;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FullCanvasStateResponse {

    private String roomCode;

    private BackgroundInfoDTO background;

    private List<ParticipantCanvasDTO> participants;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BackgroundInfoDTO {
        private String backgroundUrl;
        private String backgroundTitle;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParticipantCanvasDTO {
        private UUID clientId;
        private String nickname;
        private Integer x;
        private Integer y;
        private Double scale;
        private Double opacity;
        private Boolean isHost;
        private Integer mode;       // 기본, 누끼 제거 같은 모드 설정
        private String filter;      // 필터
        private Integer rotation;   // 회전 값
        private Boolean isMicOn;    // 마이크 on/off 상태
        private String overlay;     //오버레이
    }
}
