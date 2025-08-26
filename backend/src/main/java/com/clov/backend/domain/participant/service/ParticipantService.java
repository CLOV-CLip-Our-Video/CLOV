package com.clov.backend.domain.participant.service;

import com.clov.backend.common.exception.CustomException;
import com.clov.backend.common.response.ErrorCode;
import com.clov.backend.domain.participant.dto.request.ParticipantRequestDto;
import com.clov.backend.domain.participant.entity.Participant;
import com.clov.backend.domain.participant.repository.ParticipantRepository;
import com.clov.backend.domain.room.dto.request.RoomCreateRequestDto;
import com.clov.backend.domain.room.entity.Room;
import com.clov.backend.domain.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final RoomRepository roomRepository;

    public UUID createParticipantAsHost(String roomCode, RoomCreateRequestDto roomCreateRequestDto) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
        Participant participant = Participant.builder()
                .room(room)
                .clientId(UUID.randomUUID())
                .isHost(true)
                .joinedAt(OffsetDateTime.now())
                .lastState("{}")
                .build();
        participantRepository.save(participant);
        return participant.getClientId();
    }

    public UUID createParticipant(String roomCode, ParticipantRequestDto participantRequestDto) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
        Participant participant = Participant.builder()
                .room(room)
                .clientId(UUID.randomUUID())
                .isHost(false)
                .joinedAt(OffsetDateTime.now())
                .lastState("{}")
                .build();
        participantRepository.save(participant);
        return participant.getClientId();
    }
}
