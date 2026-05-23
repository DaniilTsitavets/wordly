package com.wordly.backend.repository;

import com.wordly.backend.entity.DailyGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyGameRepository extends JpaRepository<DailyGame, Long> {

    Optional<DailyGame> findByScheduledDate(LocalDate date);

    @Query(value = "SELECT * FROM daily_games WHERE scheduled_date IS NULL ORDER BY RANDOM() LIMIT 1 FOR UPDATE", nativeQuery = true)
    Optional<DailyGame> findRandomUnassignedForUpdate();
}