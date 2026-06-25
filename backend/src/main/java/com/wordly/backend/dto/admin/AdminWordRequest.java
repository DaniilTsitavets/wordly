package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminWordRequest(

        @NotNull(message = "subtopic_id is required")
        @JsonProperty("subtopic_id")
        Long subtopicId,

        @NotBlank(message = "word_en is required")
        @Size(max = 255)
        @JsonProperty("word_en")
        String wordEn,

        @Size(max = 255)
        @JsonProperty("transcription_en")
        String transcriptionEn,

        @NotBlank(message = "translation_ru is required")
        @Size(max = 255)
        @JsonProperty("translation_ru")
        String translationRu,

        @Size(max = 255)
        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("usage_example_en")
        String usageExampleEn,

        @JsonProperty("usage_example_en_translation_ru")
        String usageExampleEnTranslationRu,

        @Size(max = 255)
        @JsonProperty("mnemonic_image_url")
        String mnemonicImageUrl,

        @JsonProperty("mnemo_text")
        String mnemoText
) {}