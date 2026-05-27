package com.wordly.backend.dto;

import com.wordly.backend.entity.DailyGame;

import java.util.List;

public record DailyGameResponse(
        Long id,
        String idiom,
        List<String> options
) {
    public static DailyGameResponse of(DailyGame g) {
        return new DailyGameResponse(
                g.getId(),
                g.getIdiom(),
                List.of(g.getOption1(), g.getOption2(), g.getOption3(), g.getOption4())
        );
    }
}