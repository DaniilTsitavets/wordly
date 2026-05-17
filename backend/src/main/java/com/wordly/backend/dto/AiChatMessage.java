package com.wordly.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AiChatMessage(
        @NotBlank String role,
        @NotBlank String content
) {}