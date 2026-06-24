package com.wordly.backend.repository;

import com.wordly.backend.entity.UserWordState;
import com.wordly.backend.entity.enums.WordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserWordStateRepository extends JpaRepository<UserWordState, Long> {

    Optional<UserWordState> findByUserIdAndWordId(Long userId, Long wordId);

    long countByUserIdAndStatusIn(Long userId, Collection<WordStatus> statuses);

    @EntityGraph(attributePaths = "word")
    List<UserWordState> findByUserIdAndNextRecallLessThanEqual(Long userId, LocalDate date);

    List<UserWordState> findByUserIdAndSessionDate(Long userId, LocalDate date);

    Page<UserWordState> findByUserId(Long userId, Pageable pageable);

    Page<UserWordState> findByUserIdAndStatus(Long userId, WordStatus status, Pageable pageable);

    @Query("SELECT MIN(s.recallTimeMs) FROM UserWordState s WHERE s.userId = :userId")
    Optional<Integer> findBestRecallTimeMs(@Param("userId") Long userId);
}