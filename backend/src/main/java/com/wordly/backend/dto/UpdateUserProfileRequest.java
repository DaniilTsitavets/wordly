package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        String name,
        String surname,

        @Email(message = "Email must be valid")
        String email,

        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        @JsonProperty("interface_language")
        String interfaceLanguage,

        @JsonProperty("daily_goal_min")
        @Min(value = 1, message = "Daily goal must be at least 1 minute")
        @Max(value = 1440, message = "Daily goal must be at most 1440 minutes")
        Integer dailyGoalMin,

        @JsonProperty("notifications_enabled")
        Boolean notificationsEnabled,

        @JsonProperty("color_theme")
        @Pattern(regexp = "light|dark|system", message = "Color theme must be one of: light, dark, system")
        String colorTheme
) {}