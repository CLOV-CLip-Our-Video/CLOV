package com.clov.backend.domain.background.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "background")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Background {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "background_id")
    private Long backgroundId;

    @Lob
    @Column(name = "background_url", nullable = false, columnDefinition = "TEXT")
    private String backgroundUrl;

    @Column(name = "background_title", length = 16, nullable = false)
    private String backgroundTitle;
}