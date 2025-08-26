package com.clov.backend.domain.canvas.dto.request;

import com.clov.backend.domain.canvas.dto.CanvasStateDto;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

/**
 * 클라이언트가 캔버스 상태를 전송할 때 사용하는 요청 DTO.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendCanvasStateRequest implements Serializable {

    private String roomCode;     // 방 코드 (Redis Pub/Sub 채널명 및 WebSocket 토픽용)
    private UUID clientId;       // 클라이언트 고유 ID
    private Integer x;           // 위치 x
    private Integer y;           // 위치 y
    private Double scale;        // 확대/축소 비율
    private Double opacity;      // 불투명도

    /**
     * 상태 정보만 추출하여 CanvasStateDto로 변환합니다.
     * @return CanvasStateDto 객체
     */
    public CanvasStateDto toDto() {
        return CanvasStateDto.builder()
                .x(x)
                .y(y)
                .scale(scale)
                .opacity(opacity)
                .build();
    }
}
