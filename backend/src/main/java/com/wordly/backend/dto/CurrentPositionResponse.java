package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CurrentPositionResponse(
        @JsonProperty("subtopic_id")
        Long subtopicId,

        @JsonProperty("mechanic_type")
        String mechanicType
) {}