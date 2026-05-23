package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DailyProgressResponse(
        @JsonProperty("words_learned_today")
        int wordsLearnedToday,

        @JsonProperty("daily_goal_words")
        int dailyGoalWords
) {}