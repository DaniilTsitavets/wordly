package com.wordly.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record OAuthCallbackRequest(
        @NotBlank String code,
        @NotBlank String redirectUri
) {}