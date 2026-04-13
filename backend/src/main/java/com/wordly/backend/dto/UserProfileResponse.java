package com.wordly.backend.dto;

import com.wordly.backend.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String name,
        String surname,
        String email,
        @JsonProperty("is_guest")
        boolean isGuest,

        @JsonProperty("interface_language")
        String interfaceLanguage,

        @JsonProperty("daily_goal_min")
        Integer dailyGoalMin,

        @JsonProperty("notifications_enabled")
        Boolean notificationsEnabled,

        @JsonProperty("color_theme")
        String colorTheme,

        Integer streak,
        Integer gems,

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
                user.getInterfaceLanguage(),
                user.getDailyGoalMin(),
                user.getNotificationsEnabled(),
                user.getColorTheme(),
                user.getStreak(),
                user.getGems(),
                user.getLastActiveDate(),
                user.getCreatedAt()
        );
    }
}