package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TrackActivityRequest(
        @NotNull
        @Positive
        @Max(value = 86400, message = "A single activity report cannot exceed one day")
        @JsonProperty("seconds")
        Integer seconds
) {}