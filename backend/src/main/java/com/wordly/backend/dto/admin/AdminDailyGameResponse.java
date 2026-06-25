package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.DailyGame;

import java.time.LocalDate;

public record AdminDailyGameResponse(
        Long id,
        String idiom,

        @JsonProperty("option_1") String option1,
        @JsonProperty("option_2") String option2,
        @JsonProperty("option_3") String option3,
        @JsonProperty("option_4") String option4,

        @JsonProperty("correct_option")
        Integer correctOption,

        @JsonProperty("scheduled_date")
        LocalDate scheduledDate
) {
    public static AdminDailyGameResponse of(DailyGame g) {
        return new AdminDailyGameResponse(
                g.getId(), g.getIdiom(),
                g.getOption1(), g.getOption2(), g.getOption3(), g.getOption4(),
                g.getCorrectOption(), g.getScheduledDate()
        );
    }
}