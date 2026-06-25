package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.enums.MechanicType;

import java.util.List;

public record SessionDataResponse(
        @JsonProperty("subtopic_id")
        Long subtopicId,

        @JsonProperty("mechanic_type")
        MechanicType mechanicType,

        List<SessionWordResponse> words
) {}
