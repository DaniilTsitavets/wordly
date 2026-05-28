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
    public static UserProfileResponse from(User user) {
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
                user.getStreak(),
                user.getGems(),
                user.isOnboardingCompleted(),
                user.getLastActiveDate(),
                user.getCreatedAt()
        );
    }
}