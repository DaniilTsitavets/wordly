package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TopicDetailResponse(
        Long id,
        String name,
        String description,

        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("subtopic_ids")
        List<Long> subtopicIds
) {}