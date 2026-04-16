package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record LevelProgressResponse(
        @JsonProperty("mechanic_type")
        MechanicType mechanicType,,

        String status,

        @JsonProperty("started_at")
        LocalDateTime startedAt,

        @JsonProperty("completed_at")
        LocalDateTime completedAt
) {}