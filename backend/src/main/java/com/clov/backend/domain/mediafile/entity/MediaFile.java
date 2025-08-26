package com.clov.backend.domain.mediafile.entity;

import com.clov.backend.common.enums.ContentType;
import com.clov.backend.domain.room.entity.Room;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "files")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long fileId;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Column(name = "file_url", length = 255, nullable = false)
    private String fileUrl;

    @Column(name = "saved_at", nullable = true)
    private OffsetDateTime savedAt;

    /* FK ------------------------------------------------------ */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
}