package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DailyGameAnswerResponse(
        @JsonProperty("is_correct")
        boolean isCorrect,

        @JsonProperty("correct_option")
        int correctOption
) {}