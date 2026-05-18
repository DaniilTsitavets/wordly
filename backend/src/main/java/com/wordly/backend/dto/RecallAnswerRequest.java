package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecallAnswerRequest(
        @NotNull
        @JsonProperty("word_id")
        Long wordId,

        @NotBlank
        @JsonProperty("user_answer")
        String userAnswer
) {}