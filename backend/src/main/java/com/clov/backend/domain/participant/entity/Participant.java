package com.clov.backend.domain.participant.entity;

import com.clov.backend.domain.room.entity.Room;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "room_participants")
@DynamicUpdate
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long id;

    @Column(name = "client_id", length  = 64, nullable = false, columnDefinition = "BINARY(16)", unique=true)
    private UUID clientId;

    @Column(name = "is_host")
    private Boolean isHost;

    @Column(name = "joined_at", nullable = false)
    private OffsetDateTime joinedAt;

    @Column(name = "left_at")
    private OffsetDateTime leftAt;

    /**
     * 최종 상태 JSON 문자열<br>
     * DB column type: JSON
     */
    @Lob
    @Column(name = "last_state", columnDefinition = "json")
    private String lastState;

    /* FK ------------------------------------------------------ */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    public void updateLeftAt(OffsetDateTime leftAt) {
        this.leftAt = leftAt;
    }
}