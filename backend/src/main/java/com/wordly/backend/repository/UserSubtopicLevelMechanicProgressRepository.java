package com.wordly.backend.repository;

import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserSubtopicLevelMechanicProgressRepository
        extends JpaRepository<UserSubtopicLevelMechanicProgress, Long> {

    List<UserSubtopicLevelMechanicProgress> findByUserId(Long userId);

    List<UserSubtopicLevelMechanicProgress> findByUserIdAndSubtopicId(Long userId, Long subtopicId);

    @EntityGraph(attributePaths = "subtopic")
    List<UserSubtopicLevelMechanicProgress> findByUserIdAndStatusAndCompletedAtBetween(
            Long userId, ProgressStatus status, LocalDateTime from, LocalDateTime to);

    Optional<UserSubtopicLevelMechanicProgress> findFirstByUserIdAndStatusOrderByStartedAtDescIdDesc(
            Long userId,
            ProgressStatus status
    );

    Optional<UserSubtopicLevelMechanicProgress> findByUserIdAndSubtopicIdAndMechanicType(
            Long userId,
            Long subtopicId,
            MechanicType mechanicType
    );
}
