package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RecallCompleteResponse(
        @JsonProperty("total_words") int totalWords,
        int correct,
        int failed,
        @JsonProperty("gems_earned") int gemsEarned
) {}