package com.clov.backend.domain.participant.repository;

import com.clov.backend.domain.participant.entity.Participant;
import com.clov.backend.domain.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    Participant findByClientId(UUID clientId);

    List<Participant> findByRoom(Room room);
}
