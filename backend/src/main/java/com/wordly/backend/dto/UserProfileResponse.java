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

        @JsonProperty("learned_words")
        Integer learnedWords,

        @JsonProperty("words_percentage")
        Integer wordsPercentage,

        @JsonProperty("onboarding_completed")
        boolean onboardingCompleted,

        @JsonProperty("last_active_date")
        LocalDate lastActiveDate,

        @JsonProperty("created_at")
        LocalDateTime createdAt
) {
    /**
     * Profile without the platform word-progress stats (learned/percentage left {@code null}).
     * Used by the auth responses (login/register/oauth), where those counts are not computed.
     */
    public static UserProfileResponse from(User user) {
        return build(user, null, null);
    }

    /**
     * Profile enriched with the stats-screen word progress: how many of the user's words are
     * "learned" (status RECALLING or LONG_TERM_MEMORY), plus that figure as a percentage of every
     * word on the platform ({@code totalWords}, 0% when the platform has no words). Used by
     * GET/PUT /users/me.
     */
    public static UserProfileResponse from(User user, long learnedWords, long totalWords) {
        int percentage = totalWords == 0
                ? 0
                : (int) Math.round((double) learnedWords / totalWords * 100);
        return build(user, (int) learnedWords, percentage);
    }

    private static UserProfileResponse build(
            User user, Integer learnedWords, Integer wordsPercentage) {
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
                learnedWords,
                wordsPercentage,
                user.isOnboardingCompleted(),
                user.getLastActiveDate(),
                user.getCreatedAt()
        );
    }
}