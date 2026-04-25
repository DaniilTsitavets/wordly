package com.wordly.backend.repository;

import com.wordly.backend.entity.UserWordState;
import com.wordly.backend.entity.enums.WordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserWordStateRepository extends JpaRepository<UserWordState, Long> {

    Optional<UserWordState> findByUserIdAndWordId(Long userId, Long wordId);

    List<UserWordState> findByUserIdAndNextRecallLessThanEqual(Long userId, LocalDate date);

    Page<UserWordState> findByUserId(Long userId, Pageable pageable);

    Page<UserWordState> findByUserIdAndStatus(Long userId, WordStatus status, Pageable pageable);
}
