package com.wordly.backend.dto;

public record AuthResponse(
        @com.fasterxml.jackson.annotation.JsonProperty("access_token") String accessToken,
        UserProfileResponse user
) {}
