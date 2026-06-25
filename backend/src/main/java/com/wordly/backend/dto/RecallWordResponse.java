package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RecallWordResponse(
        Long id,
        @JsonProperty("word_en") String wordEn,
        @JsonProperty("translation_ru") String translationRu,
        @JsonProperty("transcription_en") String transcriptionEn,
        @JsonProperty("recall_interval") int recallInterval
) {}