package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DailyGameAnswerRequest(
        @JsonProperty("daily_game_id")
        @NotNull Long dailyGameId,

        @JsonProperty("selected_option")
        @NotNull @Min(1) @Max(4) Integer selectedOption
) {}