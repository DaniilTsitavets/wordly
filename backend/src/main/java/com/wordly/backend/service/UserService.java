package com.wordly.backend.service;

import com.wordly.backend.dto.DailyGoalClaimResponse;
import com.wordly.backend.dto.DailyProgressResponse;
import com.wordly.backend.dto.UpdateUserProfileRequest;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.DailyActivity;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.exception.EmailAlreadyExistsException;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.exception.GuestOperationNotAllowedException;
import com.wordly.backend.repository.DailyActivityRepository;
import com.wordly.backend.repository.UserRepository;
import com.wordly.backend.repository.UserWordStateRepository;
import com.wordly.backend.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int GEMS_PER_DAILY_GOAL = 10;
    private static final int DEFAULT_DAILY_GOAL_MIN = 10;
    private static final int SECONDS_PER_MINUTE = 60;

    /**
     * Anti-cheat ceiling for {@link #trackActivity}: a single report can credit at most this many
     * seconds, and never more than the real wall-clock time elapsed since the last report. The
     * frontend must therefore send periodic heartbeats (≤ this interval) while a learning screen
     * is active — a single large report cannot fast-forward the daily goal.
     */
    private static final int MAX_CREDITED_SECONDS_PER_REQUEST = 120;

    /**
     * Word statuses that count as "learned" for the stats-screen percentage: the word has finished
     * the initial learning flow (all 5 mechanics) and entered spaced repetition. See
     * {@link #buildProfile}.
     */
    private static final Set<WordStatus> LEARNED_STATUSES =
            EnumSet.of(WordStatus.RECALLING, WordStatus.LONG_TERM_MEMORY);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DailyActivityRepository dailyActivityRepository;
    private final UserWordStateRepository userWordStateRepository;
    private final WordRepository wordRepository;
    private final StreakService streakService;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = getUserOrThrow(userId);
        return buildProfile(user);
    }

    @Transactional
    public UserProfileResponse updateCurrentUserProfile(Long userId, UpdateUserProfileRequest request) {
        User user = getUserOrThrow(userId);

        if (user.isGuest()) {
            throw new GuestOperationNotAllowedException("Guest users cannot update profile");
        }

        if (request.name() != null) {
            user.setName(request.name().trim());
        }

        if (request.surname() != null) {
            user.setSurname(request.surname().trim());
        }

        if (request.email() != null) {
            String normalizedEmail = request.email().trim().toLowerCase();
            if (!normalizedEmail.equals(user.getEmail())
                    && userRepository.existsByEmailAndIdNot(normalizedEmail, user.getId())) {
                throw new EmailAlreadyExistsException("Email already registered: " + normalizedEmail);
            }
            user.setEmail(normalizedEmail);
        }

        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        if (request.interfaceLanguage() != null) {
            user.setInterfaceLanguage(request.interfaceLanguage().trim());
        }

        if (request.dailyGoalMin() != null) {
            user.setDailyGoalMin(request.dailyGoalMin());
        }

        if (request.dailyGoalWords() != null) {
            user.setDailyGoalWords(request.dailyGoalWords());
        }

        if (request.notificationsEnabled() != null) {
            user.setNotificationsEnabled(request.notificationsEnabled());
        }

        if (request.colorTheme() != null) {
            user.setColorTheme(request.colorTheme().getValue());
        }

        if (request.onboardingCompleted() != null) {
            user.setOnboardingCompleted(request.onboardingCompleted());
        }

        return buildProfile(user);
    }

    /**
     * Builds the profile response enriched with the stats-screen word progress: how many of the
     * user's words are "learned" (status in {@link #LEARNED_STATUSES}) out of every word on the
     * platform ({@code COUNT(*) FROM words}), plus the derived percentage. The streak is the
     * grace-checked value from {@link StreakService#currentStreak(User)}, never the raw column.
     */
    private UserProfileResponse buildProfile(User user) {
        long totalWords = wordRepository.count();
        long learnedWords = userWordStateRepository.countByUserIdAndStatusIn(user.getId(), LEARNED_STATUSES);
        Integer bestRecallTime = userWordStateRepository.findBestRecallTimeMs(user.getId()).orElse(null);
        return UserProfileResponse.from(
                user, streakService.currentStreak(user), learnedWords, totalWords, bestRecallTime);
    }

    @Transactional(readOnly = true)
    public DailyProgressResponse getDailyProgress(Long userId) {
        User user = getUserOrThrow(userId);
        return toDailyProgress(user, secondsSpentToday(userId));
    }

    /**
     * Accumulates study time reported by the client for the current local day. The frontend owns
     * the stopwatch (only it knows when a learning screen is actually open/active), but the value
     * is not trusted blindly: the server credits at most the real wall-clock time it observed
     * passing since the last report (see {@link #creditableSeconds}). Seconds are stored raw and
     * summed first, so nothing is lost to rounding — the single division to minutes happens later.
     */
    @Transactional
    public DailyProgressResponse trackActivity(Long userId, int reportedSeconds) {
        User user = getUserOrThrow(userId);
        LocalDateTime now = LocalDateTime.now();

        int credited = creditableSeconds(reportedSeconds, user.getLastActivityAt(), now);
        // Always advance the baseline, even on a 0-credit ping, so the next gap is measured from here.
        user.setLastActivityAt(now);
        userRepository.save(user);

        if (credited > 0) {
            // Atomic upsert: safe under concurrent reports (see DailyActivityRepository.addSeconds).
            dailyActivityRepository.addSeconds(userId, now.toLocalDate(), credited);
        }

        return toDailyProgress(user, secondsSpentToday(userId));
    }

    /**
     * How many seconds a report may add: the client's claim, capped both by the real time elapsed
     * since the last report (so reported time can't exceed observed time) and by an absolute
     * per-request ceiling (which also bounds the very first report and long idle gaps). Never
     * negative.
     */
    static int creditableSeconds(int reportedSeconds, LocalDateTime lastActivityAt, LocalDateTime now) {
        long elapsed = (lastActivityAt == null)
                ? MAX_CREDITED_SECONDS_PER_REQUEST
                : Math.max(0, Duration.between(lastActivityAt, now).getSeconds());
        long credited = Math.min(reportedSeconds, Math.min(elapsed, MAX_CREDITED_SECONDS_PER_REQUEST));
        return (int) Math.max(0, credited);
    }

    /**
     * Claims the BRD §10.1 daily-goal bonus (+10 gems). Awards once per local day the first time
     * the goal is reached; idempotent afterwards via {@code dailyGoalAwardedDate}. Exposed as its
     * own endpoint so the frontend can surface a dedicated reward screen, decoupled from the
     * level/topic/recall completion flows.
     */
    @Transactional
    public DailyGoalClaimResponse claimDailyGoal(Long userId) {
        User user = getUserOrThrow(userId);
        LocalDate today = LocalDate.now();

        // Guests never accumulate gems (consistent with level/recall awards).
        if (user.isGuest()) {
            return new DailyGoalClaimResponse(false, 0);
        }

        boolean reached = isDailyGoalReached(userId, user);
        boolean alreadyClaimed = today.equals(user.getDailyGoalAwardedDate());

        if (!reached || alreadyClaimed) {
            return new DailyGoalClaimResponse(reached, 0);
        }

        user.setGems(user.getGems() + GEMS_PER_DAILY_GOAL);
        user.setDailyGoalAwardedDate(today);
        userRepository.save(user);
        return new DailyGoalClaimResponse(true, GEMS_PER_DAILY_GOAL);
    }

    /**
     * Single source of truth for "is today's daily goal met". The goal is time-based (BRD §9.1):
     * today's accumulated study time must reach {@code daily_goal_min}. Compared in seconds so a
     * partial minute is never lost at the threshold.
     */
    private boolean isDailyGoalReached(Long userId, User user) {
        return secondsSpentToday(userId) >= resolveDailyGoalMin(user) * SECONDS_PER_MINUTE;
    }

    private int secondsSpentToday(Long userId) {
        return dailyActivityRepository.findByUserIdAndActivityDate(userId, LocalDate.now())
                .map(DailyActivity::getSecondsSpent)
                .orElse(0);
    }

    private DailyProgressResponse toDailyProgress(User user, int secondsToday) {
        return new DailyProgressResponse(toMinutes(secondsToday), resolveDailyGoalMin(user));
    }

    /**
     * Whole completed minutes (floor), so the displayed {@code minutes_today} reaches
     * {@code daily_goal_min} at exactly the same instant {@link #isDailyGoalReached} flips to true
     * (both cross at {@code goal × 60} seconds). Rounding up would show "15/15" before the goal is
     * actually met. No seconds are lost — they stay in the row and still count toward the threshold.
     */
    private static int toMinutes(int seconds) {
        return seconds / SECONDS_PER_MINUTE;
    }

    private int resolveDailyGoalMin(User user) {
        return user.getDailyGoalMin() != null ? user.getDailyGoalMin() : DEFAULT_DAILY_GOAL_MIN;
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }
}