package com.wordly.backend.service;

import com.wordly.backend.dto.DailyGameAnswerRequest;
import com.wordly.backend.dto.DailyGameAnswerResponse;
import com.wordly.backend.dto.DailyGameResponse;
import com.wordly.backend.entity.DailyGame;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.DailyGameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyGameService {

    private static final ZoneId CET = ZoneId.of("Europe/Paris");
    // Rollover at 23:00 CET so users in eastern timezones get tomorrow's game shortly after their local midnight.
    private static final int ROLLOVER_HOUR_CET = 23;

    private final DailyGameRepository dailyGameRepository;
    private final Clock clock;

    @Transactional
    public DailyGameResponse getToday() {
        LocalDate today = gameDay();

        return dailyGameRepository.findByScheduledDate(today)
                .map(DailyGameResponse::of)
                .orElseGet(() -> assignAndReturn(today));
    }

    public DailyGameAnswerResponse checkAnswer(DailyGameAnswerRequest request) {
        DailyGame game = dailyGameRepository.findById(request.dailyGameId())
                .orElseThrow(() -> new NotFoundException("Daily game not found"));
        boolean isCorrect = request.selectedOption().equals(game.getCorrectOption());
        return new DailyGameAnswerResponse(isCorrect, game.getCorrectOption());
    }

    private LocalDate gameDay() {
        ZonedDateTime now = ZonedDateTime.now(clock).withZoneSameInstant(CET);
        return now.getHour() >= ROLLOVER_HOUR_CET ? now.toLocalDate().plusDays(1) : now.toLocalDate();
    }

    private DailyGameResponse assignAndReturn(LocalDate today) {
        try {
            DailyGame game = dailyGameRepository.findRandomUnassignedForUpdate()
                    .orElseThrow(() -> {
                        log.error("Daily game pool exhausted for {}: no unassigned games left", today);
                        return new NotFoundException("No daily games available");
                    });
            game.setScheduledDate(today);
            return DailyGameResponse.of(dailyGameRepository.save(game));
        } catch (DataIntegrityViolationException e) {
            // Concurrent request already assigned a game for today
            return dailyGameRepository.findByScheduledDate(today)
                    .map(DailyGameResponse::of)
                    .orElseThrow(() -> new NotFoundException("No daily games available"));
        }
    }
}