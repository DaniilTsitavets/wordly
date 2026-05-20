package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.Subtopic;

import java.util.List;

public record AdminSubtopicResponse(
        Long id,

        @JsonProperty("topic_id")
        Long topicId,

        String name,
        String description,

        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("sort_order")
        Integer sortOrder,

        @JsonProperty("words_count")
        Integer wordsCount,

        @JsonProperty("disabled_mechanics")
        List<String> disabledMechanics
) {
    public static AdminSubtopicResponse of(Subtopic subtopic) {
        return new AdminSubtopicResponse(
                subtopic.getId(),
                subtopic.getTopic().getId(),
                subtopic.getName(),
                subtopic.getDescription(),
                subtopic.getImageUrl(),
                subtopic.getSortOrder(),
                subtopic.getWordsCount(),
                subtopic.getDisabledMechanics()
        );
    }
}