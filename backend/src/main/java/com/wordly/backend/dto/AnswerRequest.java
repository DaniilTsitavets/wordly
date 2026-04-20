package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.enums.MechanicType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AnswerRequest(
        @NotNull
        @JsonProperty("word_id")
        Long wordId,

        @NotNull
        @JsonProperty("mechanic_type")
        MechanicType mechanicType,

        @NotBlank
        @JsonProperty("user_answer")
        String userAnswer
) {}
