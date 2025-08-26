package com.clov.backend.domain.room.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class RoomLeftResponseDto {

    private UUID clientId;

    private OffsetDateTime leftAt;
}
