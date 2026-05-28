package com.wordly.backend.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

public record AdminDailyGameRequest(

        @NotBlank(message = "Idiom is required")
        @Size(max = 500)
        String idiom,

        @NotBlank(message = "option_1 is required")
        @Size(max = 500)
        @JsonProperty("option_1")
        String option1,

        @NotBlank(message = "option_2 is required")
        @Size(max = 500)
        @JsonProperty("option_2")
        String option2,

        @NotBlank(message = "option_3 is required")
        @Size(max = 500)
        @JsonProperty("option_3")
        String option3,

        @NotBlank(message = "option_4 is required")
        @Size(max = 500)
        @JsonProperty("option_4")
        String option4,

        @NotNull(message = "correct_option is required")
        @Min(value = 1, message = "correct_option must be between 1 and 4")
        @Max(value = 4, message = "correct_option must be between 1 and 4")
        @JsonProperty("correct_option")
        Integer correctOption
) {}