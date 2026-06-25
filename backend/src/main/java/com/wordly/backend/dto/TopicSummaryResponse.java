package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TopicSummaryResponse(
        Long id,
        String name,
        String description,

        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("sort_order")
        Integer sortOrder,

        @JsonProperty("subtopics_total")
        Integer subtopicsTotal,

        @JsonProperty("subtopics_completed")
        Integer subtopicsCompleted
) {}