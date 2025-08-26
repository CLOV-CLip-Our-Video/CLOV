package com.clov.backend.domain.background.repository;

import com.clov.backend.domain.background.entity.Background;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BackgroundRepository extends JpaRepository<Background, Long> {

    /* 모든 배경 찾기 :findAll() */
    /*  ID가 정확히 일치하는 배경 한 건 찾기 : findById(Long id)*/
    /*  제목이 정확히 일치하는 배경 한 건 찾기 */
    Optional<Background> findByBackgroundTitle(String backgroundTitle);


}
