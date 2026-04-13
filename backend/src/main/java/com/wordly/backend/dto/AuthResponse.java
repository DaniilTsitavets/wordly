package com.wordly.backend.dto;

public record AuthResponse(String accessToken, UserProfileResponse user) {}
