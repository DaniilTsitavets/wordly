package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.enums.MechanicType;

public record LevelCompleteResultResponse(
        @JsonProperty("mechanic_type")
        MechanicType mechanicType,

        @JsonProperty("gems_earned")
        int gemsEarned,

        @JsonProperty("next_mechanic")
        MechanicType nextMechanic,

        @JsonProperty("subtopic_completed")
        boolean subtopicCompleted
) {}
