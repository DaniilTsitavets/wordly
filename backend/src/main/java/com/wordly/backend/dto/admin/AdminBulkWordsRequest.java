package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AdminBulkWordsRequest(

        @NotNull(message = "subtopic_id is required")
        @JsonProperty("subtopic_id")
        Long subtopicId,

        @NotEmpty(message = "words must not be empty")
        @Size(max = 500, message = "words must contain at most 500 items per request")
        @Valid
        List<AdminBulkWordItem> words
) {}