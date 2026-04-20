package com.wordly.backend.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SubtopicsBatchRequest(
        @NotEmpty
        List<Long> ids
) {}
