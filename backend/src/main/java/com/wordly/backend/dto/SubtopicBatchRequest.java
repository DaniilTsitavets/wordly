package com.wordly.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SubtopicBatchRequest(
        @NotNull List<Long> ids
) {}