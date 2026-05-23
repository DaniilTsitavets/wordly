package com.wordly.backend.controller;

import com.wordly.backend.dto.DailyGameResponse;
import com.wordly.backend.service.DailyGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/daily-game")
@RequiredArgsConstructor
public class DailyGameController {

    private final DailyGameService dailyGameService;

    @GetMapping
    public DailyGameResponse getToday() {
        return dailyGameService.getToday();
    }
}