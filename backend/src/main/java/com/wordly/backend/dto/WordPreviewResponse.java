package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WordPreviewResponse(
        Long id,

        @JsonProperty("word_en")
        String wordEn,

        @JsonProperty("transcription_en")
        String transcriptionEn,

        @JsonProperty("translation_ru")
        String translationRu,

        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("has_mnemonic")
        boolean hasMnemonic,

        @JsonProperty("mnemonic_image_url")
        String mnemonicImageUrl,

        @JsonProperty("mnemonic_text")
        String mnemoDescription
) {}