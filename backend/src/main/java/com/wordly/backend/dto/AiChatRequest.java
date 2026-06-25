package com.wordly.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AiChatRequest(
        @NotNull Long subtopicId,
        @NotNull @Valid List<AiChatMessage> history,
        @NotBlank String message
) {}