package com.clov.backend.domain.room.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class RoomParticipantResponseDto {

    private UUID clientId;

    private String nickname;

    private Boolean isHost;
}
