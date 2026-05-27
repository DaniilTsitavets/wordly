package com.wordly.backend.controller;

import com.wordly.backend.dto.DailyGameAnswerRequest;
import com.wordly.backend.dto.DailyGameAnswerResponse;
import com.wordly.backend.dto.DailyGameResponse;
import com.wordly.backend.service.DailyGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/daily-game")
@RequiredArgsConstructor
public class DailyGameController {

    private final DailyGameService dailyGameService;

    @GetMapping
    public DailyGameResponse getToday() {
        return dailyGameService.getToday();
    }

    @PostMapping("/answer")
    public DailyGameAnswerResponse submitAnswer(@Valid @RequestBody DailyGameAnswerRequest request) {
        return dailyGameService.checkAnswer(request);
    }
}