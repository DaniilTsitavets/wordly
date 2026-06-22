package com.wordly.backend.service;

import com.wordly.backend.dto.DailyGoalClaimResponse;
import com.wordly.backend.dto.DailyProgressResponse;
import com.wordly.backend.dto.UpdateUserProfileRequest;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.DailyActivity;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.ColorTheme;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.exception.EmailAlreadyExistsException;
import com.wordly.backend.exception.GuestOperationNotAllowedException;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.DailyActivityRepository;
import com.wordly.backend.repository.UserRepository;
import com.wordly.backend.repository.UserWordStateRepository;
import com.wordly.backend.repository.WordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private DailyActivityRepository dailyActivityRepository;

    @Mock
    private UserWordStateRepository userWordStateRepository;

    @Mock
    private WordRepository wordRepository;

    @InjectMocks
    private UserService userService;

    private void stubWordProgress(long learned, long total) {
        when(wordRepository.count()).thenReturn(total);
        when(userWordStateRepository.countByUserIdAndStatusIn(eq(1L), any())).thenReturn(learned);
    }

    private User regularUser(long id) {
        return User.builder()
                .id(id)
                .name("Alex")
                .surname("Smith")
                .email("alex@example.com")
                .guest(false)
                .colorTheme("system")
                .interfaceLanguage("ru")
                .dailyGoalMin(10)
                .notificationsEnabled(true)
                .gems(0)
                .streak(0)
                .build();
    }

    private DailyActivity activityToday(int seconds) {
        return DailyActivity.builder()
                .userId(1L)
                .activityDate(LocalDate.now())
                .secondsSpent(seconds)
                .build();
    }

    private void stubActivityToday(int seconds) {
        when(dailyActivityRepository.findByUserIdAndActivityDate(eq(1L), any(LocalDate.class)))
                .thenReturn(Optional.of(activityToday(seconds)));
    }

    @Nested
    @DisplayName("getCurrentUserProfile")
    class GetCurrentUserProfile {

        @Test
        @DisplayName("should return profile DTO for existing user")
        void shouldReturnProfile() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubWordProgress(42, 200);

            UserProfileResponse response = userService.getCurrentUserProfile(1L);

            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.email()).isEqualTo("alex@example.com");
            assertThat(response.isGuest()).isFalse();
            assertThat(response.gems()).isZero();
            assertThat(response.learnedWords()).isEqualTo(42);
            assertThat(response.wordsPercentage()).isEqualTo(21);
        }

        @Test
        @DisplayName("words_percentage is 0 when the platform has no words (no division by zero)")
        void shouldReportZeroPercentWhenNoWords() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubWordProgress(0, 0);

            UserProfileResponse response = userService.getCurrentUserProfile(1L);

            assertThat(response.learnedWords()).isZero();
            assertThat(response.wordsPercentage()).isZero();
        }

        @Test
        @DisplayName("counts only RECALLING and LONG_TERM_MEMORY words as learned")
        void shouldQueryLearnedStatuses() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubWordProgress(5, 10);

            userService.getCurrentUserProfile(1L);

            verify(userWordStateRepository).countByUserIdAndStatusIn(
                    1L, EnumSet.of(WordStatus.RECALLING, WordStatus.LONG_TERM_MEMORY));
        }

        @Test
        @DisplayName("should throw NotFoundException when user does not exist")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getCurrentUserProfile(99L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("updateCurrentUserProfile")
    class UpdateCurrentUserProfile {

        @Test
        @DisplayName("should throw GuestOperationNotAllowedException when user is a guest")
        void shouldThrowForGuest() {
            User guest = User.builder().id(1L).guest(true).colorTheme("system").build();
            when(userRepository.findById(1L)).thenReturn(Optional.of(guest));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    "New", null, null, null, null, null, null, null, null, null
            );

            assertThatThrownBy(() -> userService.updateCurrentUserProfile(1L, request))
                    .isInstanceOf(GuestOperationNotAllowedException.class);
        }

        @Test
        @DisplayName("should update name and surname, trimming whitespace")
        void shouldUpdateNameAndSurname() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    "  NewName  ", "  NewSurname  ", null, null, null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getName()).isEqualTo("NewName");
            assertThat(user.getSurname()).isEqualTo("NewSurname");
        }

        @Test
        @DisplayName("should normalize and update email when it differs from current")
        void shouldNormalizeAndUpdateEmail() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmailAndIdNot("newemail@example.com", 1L)).thenReturn(false);

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, "  NEWEMAIL@Example.COM  ", null, null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getEmail()).isEqualTo("newemail@example.com");
        }

        @Test
        @DisplayName("should throw EmailAlreadyExistsException when new email belongs to another user")
        void shouldThrowWhenEmailTakenByOther() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmailAndIdNot("taken@example.com", 1L)).thenReturn(true);

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, "taken@example.com", null, null, null, null, null, null, null
            );

            assertThatThrownBy(() -> userService.updateCurrentUserProfile(1L, request))
                    .isInstanceOf(EmailAlreadyExistsException.class);
        }

        @Test
        @DisplayName("should not check for duplicate email when the email is unchanged")
        void shouldSkipDuplicateCheckWhenEmailUnchanged() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, "alex@example.com", null, null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            verify(userRepository, never()).existsByEmailAndIdNot(any(), any());
        }

        @Test
        @DisplayName("should encode and save new password when a non-blank password is provided")
        void shouldUpdatePassword() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(passwordEncoder.encode("newpassword")).thenReturn("new-hash");

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, null, "newpassword", null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        }

        @Test
        @DisplayName("should not update password when the provided value is blank")
        void shouldNotUpdatePasswordWhenBlank() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, null, "   ", null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            verify(passwordEncoder, never()).encode(anyString());
            assertThat(user.getPasswordHash()).isNull();
        }

        @Test
        @DisplayName("should update settings: language, daily goal, notifications, and color theme")
        void shouldUpdateSettings() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, null, null, "en", 30, null, false, ColorTheme.DARK, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getInterfaceLanguage()).isEqualTo("en");
            assertThat(user.getDailyGoalMin()).isEqualTo(30);
            assertThat(user.getNotificationsEnabled()).isFalse();
            assertThat(user.getColorTheme()).isEqualTo("dark");
        }

        @Test
        @DisplayName("should not modify fields when all request values are null")
        void shouldLeaveFieldsUnchangedWhenRequestIsEmpty() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, null, null, null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getName()).isEqualTo("Alex");
            assertThat(user.getSurname()).isEqualTo("Smith");
            assertThat(user.getEmail()).isEqualTo("alex@example.com");
        }
    }

    @Nested
    @DisplayName("getDailyProgress")
    class GetDailyProgress {

        @Test
        @DisplayName("should report today's minutes against the time-based goal")
        void shouldReportMinutes() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubActivityToday(540); // 9 minutes

            DailyProgressResponse response = userService.getDailyProgress(1L);

            assertThat(response.minutesToday()).isEqualTo(9);
            assertThat(response.dailyGoalMin()).isEqualTo(10);
        }

        @Test
        @DisplayName("should report zero minutes when there is no activity today")
        void shouldReportZeroWhenNoActivity() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(dailyActivityRepository.findByUserIdAndActivityDate(eq(1L), any(LocalDate.class)))
                    .thenReturn(Optional.empty());

            DailyProgressResponse response = userService.getDailyProgress(1L);

            assertThat(response.minutesToday()).isZero();
            assertThat(response.dailyGoalMin()).isEqualTo(10);
        }

        @Test
        @DisplayName("should show whole completed minutes (floor), not round up before the goal")
        void shouldFloorToWholeMinutes() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubActivityToday(599); // 9 min 59 s -> 9, not 10

            DailyProgressResponse response = userService.getDailyProgress(1L);

            assertThat(response.minutesToday()).isEqualTo(9);
        }

        @Test
        @DisplayName("minutes reach the goal exactly when the goal-reached threshold is crossed")
        void minutesReachGoalInLockstepWithThreshold() {
            User user = regularUser(1L);
            user.setDailyGoalMin(15);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubActivityToday(900); // exactly 15 min

            DailyProgressResponse response = userService.getDailyProgress(1L);

            assertThat(response.minutesToday()).isEqualTo(15); // 15/15 only at the real threshold
        }
    }

    @Nested
    @DisplayName("trackActivity")
    class TrackActivity {

        @Test
        @DisplayName("should cap the first report at the per-request ceiling and credit the day")
        void shouldCapFirstReportAndCreditDay() {
            User user = regularUser(1L); // lastActivityAt == null
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            // re-query for the response after the upsert
            when(dailyActivityRepository.findByUserIdAndActivityDate(eq(1L), any(LocalDate.class)))
                    .thenReturn(Optional.of(activityToday(120)));

            DailyProgressResponse response = userService.trackActivity(1L, 180); // claims 3 min

            assertThat(response.minutesToday()).isEqualTo(2); // capped to 120s = 2 min
            assertThat(response.dailyGoalMin()).isEqualTo(10);
            assertThat(user.getLastActivityAt()).isNotNull();
            verify(dailyActivityRepository).addSeconds(eq(1L), any(LocalDate.class), eq(120));
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("should cap credit at the ceiling after a long idle gap (no idle-time budget)")
        void shouldCapAfterLongGap() {
            User user = regularUser(1L);
            user.setLastActivityAt(LocalDateTime.now().minusHours(2)); // long gap
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(dailyActivityRepository.findByUserIdAndActivityDate(eq(1L), any(LocalDate.class)))
                    .thenReturn(Optional.of(activityToday(720))); // 600 existing + 120 credited

            DailyProgressResponse response = userService.trackActivity(1L, 1000); // claims ~16 min

            assertThat(response.minutesToday()).isEqualTo(12);
            verify(dailyActivityRepository).addSeconds(eq(1L), any(LocalDate.class), eq(120)); // +120 only
        }

        @Test
        @DisplayName("should credit nothing when no real time has elapsed since the last report")
        void shouldNotCreditWhenNoTimeElapsed() {
            User user = regularUser(1L);
            user.setLastActivityAt(LocalDateTime.now()); // essentially now
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(dailyActivityRepository.findByUserIdAndActivityDate(eq(1L), any(LocalDate.class)))
                    .thenReturn(Optional.empty());

            DailyProgressResponse response = userService.trackActivity(1L, 100);

            assertThat(response.minutesToday()).isZero();
            verify(dailyActivityRepository, never()).addSeconds(any(), any(), anyInt());
            verify(userRepository).save(user); // baseline still advanced
        }
    }

    @Nested
    @DisplayName("creditableSeconds")
    class CreditableSeconds {

        private final LocalDateTime now = LocalDateTime.of(2026, 6, 15, 12, 0, 0);

        @Test
        @DisplayName("first report (no baseline) is capped at the per-request ceiling")
        void firstReportCapped() {
            assertThat(UserService.creditableSeconds(30, null, now)).isEqualTo(30);
            assertThat(UserService.creditableSeconds(5000, null, now)).isEqualTo(120);
        }

        @Test
        @DisplayName("credit is bounded by the real elapsed time since the last report")
        void boundedByElapsed() {
            LocalDateTime last = now.minusSeconds(30);
            assertThat(UserService.creditableSeconds(30, last, now)).isEqualTo(30);
            assertThat(UserService.creditableSeconds(1000, last, now)).isEqualTo(30); // elapsed caps it
        }

        @Test
        @DisplayName("a long gap is still capped at the per-request ceiling")
        void longGapCapped() {
            assertThat(UserService.creditableSeconds(1000, now.minusHours(1), now)).isEqualTo(120);
        }

        @Test
        @DisplayName("no credit for zero or negative (clock-skew) elapsed time")
        void zeroOrNegativeElapsed() {
            assertThat(UserService.creditableSeconds(100, now, now)).isZero();
            assertThat(UserService.creditableSeconds(100, now.plusSeconds(10), now)).isZero();
        }
    }

    @Nested
    @DisplayName("claimDailyGoal")
    class ClaimDailyGoal {

        @Test
        @DisplayName("should award +10 once when today's study time reaches the goal")
        void shouldAwardWhenGoalReached() {
            User user = regularUser(1L);
            user.setDailyGoalMin(5); // 300 seconds
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubActivityToday(300);

            DailyGoalClaimResponse response = userService.claimDailyGoal(1L);

            assertThat(response.reached()).isTrue();
            assertThat(response.gemsAwarded()).isEqualTo(10);
            assertThat(user.getGems()).isEqualTo(10);
            assertThat(user.getDailyGoalAwardedDate()).isEqualTo(LocalDate.now());
        }

        @Test
        @DisplayName("should report reached but award nothing when already claimed today")
        void shouldNotAwardTwiceSameDay() {
            User user = regularUser(1L);
            user.setDailyGoalMin(5);
            user.setDailyGoalAwardedDate(LocalDate.now());
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubActivityToday(300);

            DailyGoalClaimResponse response = userService.claimDailyGoal(1L);

            assertThat(response.reached()).isTrue();
            assertThat(response.gemsAwarded()).isZero();
            assertThat(user.getGems()).isZero();
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should never award the bonus to a guest user")
        void shouldNotAwardForGuest() {
            User guest = User.builder().id(1L).guest(true).gems(0).dailyGoalMin(5).build();
            when(userRepository.findById(1L)).thenReturn(Optional.of(guest));

            DailyGoalClaimResponse response = userService.claimDailyGoal(1L);

            assertThat(response.reached()).isFalse();
            assertThat(response.gemsAwarded()).isZero();
            assertThat(guest.getGems()).isZero();
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should not award when today's study time is below the goal")
        void shouldNotAwardWhenBelowGoal() {
            User user = regularUser(1L);
            user.setDailyGoalMin(10); // 600 seconds
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            stubActivityToday(300); // 5 min, below goal

            DailyGoalClaimResponse response = userService.claimDailyGoal(1L);

            assertThat(response.reached()).isFalse();
            assertThat(response.gemsAwarded()).isZero();
            assertThat(user.getGems()).isZero();
            assertThat(user.getDailyGoalAwardedDate()).isNull();
        }
    }
}