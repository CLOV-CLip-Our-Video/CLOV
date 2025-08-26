package com.clov.backend.domain.roomstate.dto;

import com.clov.backend.domain.canvas.dto.CanvasStateDto;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.util.UUID;

/**
 * 클라이언트와 서버 간 WebSocket 메시지 및 Redis Pub/Sub 메시지의 공통 포맷입니다.
 * 다양한 이벤트 유형에 따라 필요한 필드만 채워서 사용합니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomMessageDto {

    /**
     * 이벤트 유형 (join-room, update-position, start-recording 등)
     */
    @JsonIgnore
    private String event;

    /**
     * 방 코드 (WebSocket topic 및 Redis Pub/Sub 채널명으로 사용됨)
     */
    private String roomCode;

    /**
     * 메시지를 보낸 클라이언트 ID (UUID)
     */
    private UUID clientId;

    /**
     * 클라이언트 닉네임 (join-room 이벤트에 사용)
     */
    private String nickname;

    /**
     * 클라이언트의 캔버스 상태 정보 (update-position 이벤트에 사용)
     */
    private CanvasStateDto state;

    /**
     * 녹화 여부 플래그 (start-recording 이벤트에 사용)
     */
    private Boolean isRecording;


    /**
     *  클라이언트의 배경 화면 정보
     */
    private CanvasStateDto.BackgroundDto background;


    /**
     * 카운트다운 시작 시간 (countdown-start 이벤트에 사용)
     */
    private String startedAt;

    /**
     * 카운트다운 지속 시간 (초 단위, countdown-start 이벤트에 사용)
     */
    private Integer duration;

    /**
     * 에러 또는 서버 응답 메시지 (옵션)
     */
    private String message;
    /**
     * 방장 위임 시 기존 방장 ID (assign-host 이벤트에 사용)
     */
    private String from;

    /**
     * 방장 위임 시 새로운 방장 ID (assign-host 이벤트에 사용)
     */
    private String to;

    /*
     * 캔버스 배경 Id
     */
    private Long backgroundId;
}
