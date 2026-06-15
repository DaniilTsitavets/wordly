package com.wordly.backend.dto;

import com.wordly.backend.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.enums.ColorTheme;
import com.wordly.backend.entity.enums.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String name,
        String surname,
        String email,
        @JsonProperty("is_guest")
        boolean isGuest,

        Role role,

        @JsonProperty("interface_language")
        String interfaceLanguage,

        @JsonProperty("daily_goal_min")
        Integer dailyGoalMin,

        @JsonProperty("daily_goal_words")
        Integer dailyGoalWords,

        @JsonProperty("notifications_enabled")
        Boolean notificationsEnabled,

        @JsonProperty("color_theme")
        ColorTheme colorTheme,

        Integer streak,
        Integer gems,

        @JsonProperty("onboarding_completed")
        boolean onboardingCompleted,

        @JsonProperty("last_active_date")
        LocalDate lastActiveDate,

        @JsonProperty("created_at")
        LocalDateTime createdAt
) {
    /**
     * Builds the profile with a streak computed on the fly (see {@code StreakService}). The
     * {@code users.streak} column is no longer authoritative for display — always pass the
     * grace-checked value from {@code StreakService.currentStreak}. There is intentionally no
     * single-arg overload so no caller can accidentally surface the stale raw column.
     */
    public static UserProfileResponse from(User user, Integer streak) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getSurname(),
                user.getEmail(),
                user.isGuest(),
                user.getRole() == null ? Role.USER : user.getRole(),
                user.getInterfaceLanguage(),
                user.getDailyGoalMin(),
                user.getDailyGoalWords(),
                user.getNotificationsEnabled(),
                ColorTheme.fromValue(user.getColorTheme()),
                streak,
                user.getGems(),
                user.isOnboardingCompleted(),
                user.getLastActiveDate(),
                user.getCreatedAt()
        );
    }
}