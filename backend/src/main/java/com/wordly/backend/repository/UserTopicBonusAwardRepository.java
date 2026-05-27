package com.wordly.backend.repository;

import com.wordly.backend.entity.UserTopicBonusAward;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserTopicBonusAwardRepository extends JpaRepository<UserTopicBonusAward, Long> {

    boolean existsByUserIdAndTopicId(Long userId, Long topicId);
}