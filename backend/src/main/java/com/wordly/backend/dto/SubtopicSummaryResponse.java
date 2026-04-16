package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record SubtopicSummaryResponse(
        Long id,
        String name,
        String description,

        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("sort_order")
        Integer sortOrder,

        @JsonProperty("words_count")
        Integer wordsCount,

        @JsonProperty("disabled_mechanics")
        List<String> disabledMechanics,

        ProgressStatus status
) {}