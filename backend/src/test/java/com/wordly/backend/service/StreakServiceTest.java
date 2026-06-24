package com.wordly.backend.service;

import com.wordly.backend.entity.User;
import com.wordly.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StreakService (stored incremental, grace model)")
class StreakServiceTest {

    @Mock UserRepository userRepository;
    @InjectMocks StreakService streakService;

    private static final LocalDate TODAY = LocalDate.of(2026, 6, 15);

    private User user(Integer streak, LocalDate lastActiveDate) {
        return User.builder().streak(streak).lastActiveDate(lastActiveDate).build();
    }

    @Nested
    @DisplayName("applyActivity (increment on an active day)")
    class ApplyActivity {

        @Test
        @DisplayName("first ever activity → streak 1")
        void firstEver() {
            User u = user(0, null);
            boolean changed = StreakService.applyActivity(u, TODAY);
            assertThat(changed).isTrue();
            assertThat(u.getStreak()).isEqualTo(1);
            assertThat(u.getLastActiveDate()).isEqualTo(TODAY);
        }

        @Test
        @DisplayName("active again the next day → streak + 1")
        void consecutiveDay() {
            User u = user(5, TODAY.minusDays(1));
            boolean changed = StreakService.applyActivity(u, TODAY);
            assertThat(changed).isTrue();
            assertThat(u.getStreak()).isEqualTo(6);
            assertThat(u.getLastActiveDate()).isEqualTo(TODAY);
        }

        @Test
        @DisplayName("second activity same day → no-op, no change")
        void sameDayNoOp() {
            User u = user(5, TODAY);
            boolean changed = StreakService.applyActivity(u, TODAY);
            assertThat(changed).isFalse();
            assertThat(u.getStreak()).isEqualTo(5);
        }

        @Test
        @DisplayName("gap of a full missed day → reset to 1")
        void gapResets() {
            User u = user(9, TODAY.minusDays(2));
            boolean changed = StreakService.applyActivity(u, TODAY);
            assertThat(changed).isTrue();
            assertThat(u.getStreak()).isEqualTo(1);
            assertThat(u.getLastActiveDate()).isEqualTo(TODAY);
        }

        @Test
        @DisplayName("null stored streak is treated as 0")
        void nullStreakTreatedAsZero() {
            User u = user(null, TODAY.minusDays(1));
            StreakService.applyActivity(u, TODAY);
            assertThat(u.getStreak()).isEqualTo(1);
        }

        @Test
        @DisplayName("new high streak ratchets the historical longest")
        void longestRatchetsUp() {
            User u = User.builder().streak(5).longestStreak(5)
                    .lastActiveDate(TODAY.minusDays(1)).build();
            StreakService.applyActivity(u, TODAY);
            assertThat(u.getStreak()).isEqualTo(6);
            assertThat(u.getLongestStreak()).isEqualTo(6);
        }

        @Test
        @DisplayName("a broken streak resets current but keeps the historical longest")
        void longestSurvivesReset() {
            User u = User.builder().streak(9).longestStreak(9)
                    .lastActiveDate(TODAY.minusDays(2)).build();
            StreakService.applyActivity(u, TODAY);
            assertThat(u.getStreak()).isEqualTo(1);
            assertThat(u.getLongestStreak()).isEqualTo(9);
        }

        @Test
        @DisplayName("current below the record does not lower the longest")
        void longestNotLowered() {
            User u = User.builder().streak(2).longestStreak(15)
                    .lastActiveDate(TODAY.minusDays(1)).build();
            StreakService.applyActivity(u, TODAY);
            assertThat(u.getStreak()).isEqualTo(3);
            assertThat(u.getLongestStreak()).isEqualTo(15);
        }

        @Test
        @DisplayName("null longest is treated as 0 and seeded by the first activity")
        void nullLongestTreatedAsZero() {
            User u = User.builder().streak(0).longestStreak(null).lastActiveDate(null).build();
            StreakService.applyActivity(u, TODAY);
            assertThat(u.getLongestStreak()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("recordActivity (public, delegates to applyActivity + save)")
    class RecordActivity {

        @Test
        @DisplayName("saves user when activity causes a state change")
        void savesWhenChanged() {
            User u = user(0, null);
            when(userRepository.findById(1L)).thenReturn(Optional.of(u));

            streakService.recordActivity(1L);

            verify(userRepository).save(u);
            assertThat(u.getStreak()).isEqualTo(1);
        }

        @Test
        @DisplayName("does not save when activity is same-day no-op")
        void doesNotSaveOnSameDayNoOp() {
            User u = user(3, LocalDate.now());
            when(userRepository.findById(2L)).thenReturn(Optional.of(u));

            streakService.recordActivity(2L);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("does nothing when user not found")
        void doesNothingWhenUserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            streakService.recordActivity(99L);

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("currentStreak (grace read)")
    class CurrentStreak {

        @Test
        @DisplayName("no activity ever → 0")
        void neverActive() {
            assertThat(StreakService.currentStreak(user(0, null), TODAY)).isZero();
        }

        @Test
        @DisplayName("active today → shows stored streak")
        void activeToday() {
            assertThat(StreakService.currentStreak(user(7, TODAY), TODAY)).isEqualTo(7);
        }

        @Test
        @DisplayName("grace: last active yesterday, today still empty → still shows streak")
        void graceYesterday() {
            assertThat(StreakService.currentStreak(user(7, TODAY.minusDays(1)), TODAY)).isEqualTo(7);
        }

        @Test
        @DisplayName("a full day missed (last active two days ago) → 0")
        void brokenAfterMissedDay() {
            assertThat(StreakService.currentStreak(user(7, TODAY.minusDays(2)), TODAY)).isZero();
        }
    }
}
