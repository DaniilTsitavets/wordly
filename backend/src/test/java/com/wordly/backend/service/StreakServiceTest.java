package com.wordly.backend.service;

import com.wordly.backend.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("StreakService (stored incremental, grace model)")
class StreakServiceTest {

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
