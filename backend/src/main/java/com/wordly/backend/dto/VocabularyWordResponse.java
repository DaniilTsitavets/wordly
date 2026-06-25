package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.enums.WordStatus;

import java.time.LocalDate;

public record VocabularyWordResponse(
        Long id,
        @JsonProperty("word_en") String wordEn,
        @JsonProperty("transcription_en") String transcriptionEn,
        @JsonProperty("translation_ru") String translationRu,
        @JsonProperty("image_url") String imageUrl,
        WordStatus status,
        @JsonProperty("next_recall") LocalDate nextRecall
) {}
