package com.wordly.backend.repository;

import com.wordly.backend.entity.UserWordState;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserWordStateRepository extends JpaRepository<UserWordState, Long> {

    Optional<UserWordState> findByUserIdAndWordId(Long userId, Long wordId);

    @EntityGraph(attributePaths = "word")
    List<UserWordState> findByUserIdAndNextRecallLessThanEqual(Long userId, LocalDate date);

    List<UserWordState> findByUserIdAndSessionDate(Long userId, LocalDate date);
}
