package com.wordly.backend.dto;

import com.wordly.backend.entity.User;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        boolean isGuest,
        int gems,
        int streak
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isGuest(),
                user.getGems(),
                user.getStreak()
        );
    }
}