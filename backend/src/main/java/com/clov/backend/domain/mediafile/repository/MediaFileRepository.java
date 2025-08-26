package com.clov.backend.domain.mediafile.repository;

import com.clov.backend.domain.mediafile.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
}