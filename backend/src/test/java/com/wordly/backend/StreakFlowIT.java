package com.wordly.backend;

import com.wordly.backend.dto.CompleteSessionRequest;
import com.wordly.backend.dto.DailyGoalClaimResponse;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.DailyActivity;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.repository.DailyActivityRepository;
import com.wordly.backend.repository.UserRepository;
import com.wordly.backend.service.LearningService;
import com.wordly.backend.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end check (real Postgres) of the exact flow that was questioned: complete a level
 * (awards gems AND records streak in one transaction) → reach the daily goal and claim it (a
 * separate transaction that also writes the users row) → the streak must survive and be readable
 * through the profile. Verifies there is no lost update / clobbering between the gems and streak
 * writes on the {@code users} row in normal sequential usage.
 *
 * <p>Naming ends in {@code IT} so Surefire does not pick it up in a DB-less {@code mvn test}; run
 * explicitly with a live DB: {@code mvn test -Dtest=StreakFlowIT}.
 */
@SpringBootTest
@DisplayName("Streak flow IT: level → gems → daily goal → streak")
class StreakFlowIT {

    /** AiChatService needs a classic (Jackson 2) ObjectMapper that the auto-config doesn't provide. */
    @TestConfiguration
    static class TestBeans {
        @Bean
        ObjectMapper objectMapper() {
            return new ObjectMapper();
        }
    }

    private static final long FRUITS_SUBTOPIC_ID = 1L; // seeded in V2, all mechanics enabled
    private static final int GEMS_PER_LEVEL = 5;
    private static final int GEMS_PER_DAILY_GOAL = 10;

    @Autowired
    private LearningService learningService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DailyActivityRepository dailyActivityRepository;

    @Test
    void levelThenGemsThenDailyGoalThenStreak_allPersistConsistently() {
        // Registered user with a tiny daily goal (1 min) so it is easy to reach.
        User user = userRepository.save(User.builder()
                .name("IT").surname("User")
                .email("streak-it-" + UUID.randomUUID() + "@wordly.local")
                .guest(false)
                .dailyGoalMin(1)
                .build());
        Long userId = user.getId();

        // 1) Complete the first level (MNEMONIC_CARDS): +5 gems AND streak recorded in one tx.
        learningService.completeLevel(
                FRUITS_SUBTOPIC_ID, new CompleteSessionRequest(MechanicType.MNEMONIC_CARDS), userId, false);

        User afterLevel = userRepository.findById(userId).orElseThrow();
        assertThat(afterLevel.getGems()).isEqualTo(GEMS_PER_LEVEL);
        assertThat(afterLevel.getStreak()).isEqualTo(1);
        assertThat(afterLevel.getLastActiveDate()).isEqualTo(LocalDate.now());

        // 2) Reach the daily goal (1 min = 60s) and claim it: +10 gems in a separate transaction
        //    that also rewrites the users row.
        dailyActivityRepository.save(DailyActivity.builder()
                .userId(userId).activityDate(LocalDate.now()).secondsSpent(60).build());
        DailyGoalClaimResponse claim = userService.claimDailyGoal(userId);
        assertThat(claim.reached()).isTrue();
        assertThat(claim.gemsAwarded()).isEqualTo(GEMS_PER_DAILY_GOAL);

        // 3) The streak must NOT be clobbered by the daily-goal gems write; gems accumulate.
        User afterGoal = userRepository.findById(userId).orElseThrow();
        assertThat(afterGoal.getGems()).isEqualTo(GEMS_PER_LEVEL + GEMS_PER_DAILY_GOAL);
        assertThat(afterGoal.getStreak()).isEqualTo(1);
        assertThat(afterGoal.getDailyGoalAwardedDate()).isEqualTo(LocalDate.now());

        // 4) Profile surfaces the (grace-checked) streak.
        UserProfileResponse profile = userService.getCurrentUserProfile(userId);
        assertThat(profile.streak()).isEqualTo(1);
        assertThat(profile.gems()).isEqualTo(GEMS_PER_LEVEL + GEMS_PER_DAILY_GOAL);
    }
}