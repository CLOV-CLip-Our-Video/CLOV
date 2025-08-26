package com.clov.backend.domain.participant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class ParticipantResponseDto {

    private String roomCode;

    private UUID clientId;

    private OffsetDateTime joinedAt;

    private Boolean isHost;
}
