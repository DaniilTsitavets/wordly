package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String name,
        String surname,
        String email,

        @JsonProperty("is_guest")
        boolean isGuest,

        Role role,

        Integer streak,
        Integer gems,

        @JsonProperty("last_active_date")
        LocalDate lastActiveDate,

        @JsonProperty("created_at")
        LocalDateTime createdAt
) {
    public static AdminUserResponse of(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getSurname(),
                user.getEmail(),
                user.isGuest(),
                user.getRole() == null ? Role.USER : user.getRole(),
                user.getStreak(),
                user.getGems(),
                user.getLastActiveDate(),
                user.getCreatedAt()
        );
    }
}