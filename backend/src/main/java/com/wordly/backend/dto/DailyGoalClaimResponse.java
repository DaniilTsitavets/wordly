package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DailyGoalClaimResponse(
        @JsonProperty("reached")
        boolean reached,

        @JsonProperty("gems_awarded")
        int gemsAwarded
) {}
