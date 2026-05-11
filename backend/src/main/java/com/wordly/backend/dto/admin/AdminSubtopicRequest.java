package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.enums.MechanicType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AdminSubtopicRequest(

        @NotNull(message = "topic_id is required")
        @JsonProperty("topic_id")
        Long topicId,

        @NotBlank(message = "Name is required")
        @Size(max = 255, message = "Name must be 255 characters or less")
        String name,

        @Size(max = 10000, message = "Description must be 10000 characters or less")
        String description,

        @JsonProperty("image_url")
        @Size(max = 255, message = "Image URL must be 255 characters or less")
        String imageUrl,

        @JsonProperty("sort_order")
        @PositiveOrZero(message = "Sort order must be non-negative")
        Integer sortOrder,

        @JsonProperty("disabled_mechanics")
        List<MechanicType> disabledMechanics
) {}