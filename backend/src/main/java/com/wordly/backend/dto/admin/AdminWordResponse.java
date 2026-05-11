package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.Word;

public record AdminWordResponse(
        Long id,

        @JsonProperty("subtopic_id")
        Long subtopicId,

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

        @JsonProperty("mnemonic_image_url")
        String mnemonicImageUrl,

        @JsonProperty("mnemo_text")
        String mnemoText
) {
    public static AdminWordResponse of(Word word) {
        return new AdminWordResponse(
                word.getId(),
                word.getSubtopic().getId(),
                word.getWordEn(),
                word.getTranscriptionEn(),
                word.getTranslationRu(),
                word.getImageUrl(),
                word.getUsageExampleEn(),
                word.getUsageExampleEnTranslationRu(),
                word.getMnemonicImageUrl(),
                word.getMnemoText()
        );
    }
}