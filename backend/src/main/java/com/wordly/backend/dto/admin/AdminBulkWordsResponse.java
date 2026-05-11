package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AdminBulkWordsResponse(

        @JsonProperty("subtopic_id")
        Long subtopicId,

        Integer created,

        List<AdminWordResponse> words
) {}