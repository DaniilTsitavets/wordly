package com.wordly.backend.repository;

import com.wordly.backend.entity.DailyActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyActivityRepository extends JpaRepository<DailyActivity, Long> {

    Optional<DailyActivity> findByUserIdAndActivityDate(Long userId, LocalDate activityDate);

    /**
     * Atomically adds {@code seconds} to the (user, day) row, creating it if absent. A single
     * statement — safe under concurrent reports (no read-modify-write race, no duplicate-insert
     * conflict, no lost update).
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = """
            INSERT INTO daily_activity (user_id, activity_date, seconds_spent)
            VALUES (:userId, :activityDate, :seconds)
            ON CONFLICT (user_id, activity_date)
            DO UPDATE SET seconds_spent = daily_activity.seconds_spent + EXCLUDED.seconds_spent
            """, nativeQuery = true)
    void addSeconds(@Param("userId") Long userId,
                    @Param("activityDate") LocalDate activityDate,
                    @Param("seconds") int seconds);
}