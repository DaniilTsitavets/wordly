package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.Topic;

public record AdminTopicResponse(
        Long id,
        String name,
        String description,

        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("sort_order")
        Integer sortOrder,

        @JsonProperty("subtopics_count")
        long subtopicsCount
) {
    public static AdminTopicResponse of(Topic topic, long subtopicsCount) {
        return new AdminTopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getDescription(),
                topic.getImageUrl(),
                topic.getSortOrder(),
                subtopicsCount
        );
    }
}