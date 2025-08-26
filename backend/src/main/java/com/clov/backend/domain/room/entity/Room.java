package com.clov.backend.domain.room.entity;

import com.clov.backend.common.domain.BaseTimeEntity;
import com.clov.backend.common.enums.RoomStatus;
import com.clov.backend.domain.mediafile.entity.MediaFile;
import com.clov.backend.domain.participant.entity.Participant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room extends BaseTimeEntity {

    /** Surrogate Key (Auto-Increment Primary Key) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(name = "room_code", length = 12, nullable = false,unique = true)
    private String roomCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RoomStatus status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    /* 관계 ---------------------------------------------------- */

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participant> participants;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MediaFile> files;
}