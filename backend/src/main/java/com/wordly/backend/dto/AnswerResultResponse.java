package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AnswerResultResponse(
        @JsonProperty("word_id")
        Long wordId,

        @JsonProperty("is_correct")
        boolean isCorrect,

        @JsonProperty("correct_answer")
        String correctAnswer
) {}
