package com.wordly.backend.service;

import com.wordly.backend.dto.DailyGoalClaimResponse;
import com.wordly.backend.dto.DailyProgressResponse;
import com.wordly.backend.dto.UpdateUserProfileRequest;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import com.wordly.backend.exception.EmailAlreadyExistsException;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.exception.GuestOperationNotAllowedException;
import com.wordly.backend.repository.UserRepository;
import com.wordly.backend.repository.UserSubtopicLevelMechanicProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int GEMS_PER_DAILY_GOAL = 10;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserSubtopicLevelMechanicProgressRepository progressRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = getUserOrThrow(userId);
        return UserProfileResponse.from(user);
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

        return UserProfileResponse.from(user);
    }

    @Transactional(readOnly = true)
    public DailyProgressResponse getDailyProgress(Long userId) {
        User user = getUserOrThrow(userId);
        int wordsLearnedToday = countWordsLearnedToday(userId);
        return new DailyProgressResponse(wordsLearnedToday, resolveDailyGoal(user));
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
     * Single source of truth for "is today's daily goal met". Currently word-based
     * (BRD divergence noted in CLAUDE.md); swap this body for a minutes-based check
     * when the daily goal moves to time tracking (BRD §9.1).
     */
    private boolean isDailyGoalReached(Long userId, User user) {
        return countWordsLearnedToday(userId) >= resolveDailyGoal(user);
    }

    private int countWordsLearnedToday(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<UserSubtopicLevelMechanicProgress> todayCompletions = progressRepository
                .findByUserIdAndStatusAndCompletedAtBetween(userId, ProgressStatus.COMPLETED, startOfDay, endOfDay);

        Set<Long> counted = new HashSet<>();
        int wordsLearnedToday = 0;

        for (UserSubtopicLevelMechanicProgress p : todayCompletions) {
            Long subtopicId = p.getSubtopic().getId();
            if (counted.contains(subtopicId)) continue;
            MechanicType first = firstAvailableMechanic(p.getSubtopic().getDisabledMechanics());
            if (p.getMechanicType() == first) {
                wordsLearnedToday += p.getSubtopic().getWordsCount();
                counted.add(subtopicId);
            }
        }

        return wordsLearnedToday;
    }

    private int resolveDailyGoal(User user) {
        return user.getDailyGoalWords() != null ? user.getDailyGoalWords() : 10;
    }

    private MechanicType firstAvailableMechanic(List<String> disabledMechanics) {
        for (MechanicType type : MechanicType.values()) {
            if (!disabledMechanics.contains(type.getValue())) {
                return type;
            }
        }
        throw new IllegalStateException("All mechanic types are disabled for subtopic");
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }
}