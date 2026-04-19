package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SessionWordResponse(
        Long id,

        @JsonProperty("word_en")
        String wordEn,

        @JsonProperty("transcription_en")
        String transcriptionEn,

        @JsonProperty("translation_ru")
        String translationRu,

        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("usage_example_en")
        String usageExampleEn,

        @JsonProperty("usage_example_en_translation_ru")
        String usageExampleEnTranslationRu,

        MnemonicResponse mnemonic
) {}
