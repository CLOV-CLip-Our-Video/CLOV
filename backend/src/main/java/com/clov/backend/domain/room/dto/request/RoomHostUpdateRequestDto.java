package com.clov.backend.domain.room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomHostUpdateRequestDto {
    private UUID previousHostId;
    private UUID newHostId;
}
