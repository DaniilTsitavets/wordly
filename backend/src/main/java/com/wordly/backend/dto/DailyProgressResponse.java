package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DailyProgressResponse(
        @JsonProperty("minutes_today")
        int minutesToday,

        @JsonProperty("daily_goal_min")
        int dailyGoalMin
) {}
