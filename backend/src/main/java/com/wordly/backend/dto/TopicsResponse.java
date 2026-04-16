package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TopicsResponse(
        List<TopicSummaryResponse> topics,

        @JsonProperty("current_position")
        CurrentPositionResponse currentPosition
) {}