package com.clov.backend.domain.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class RoomCreateResponseDto {

    private String roomCode;

    private UUID hostId;

    private String joinUrl;

    private OffsetDateTime createdAt;

    private Boolean isHost;

}
