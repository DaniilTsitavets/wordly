package com.wordly.backend.service;

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

    private final DailyGameRepository dailyGameRepository;
    private final Clock clock;

    @Transactional
    public DailyGameResponse getToday() {
        LocalDate today = gameDay();

        return dailyGameRepository.findByScheduledDate(today)
                .map(DailyGameResponse::of)
                .orElseGet(() -> assignAndReturn(today));
    }

    private LocalDate gameDay() {
        ZonedDateTime now = ZonedDateTime.now(clock).withZoneSameInstant(CET);
        return now.getHour() >= 23 ? now.toLocalDate().plusDays(1) : now.toLocalDate();
    }

    private DailyGameResponse assignAndReturn(LocalDate today) {
        try {
            DailyGame game = dailyGameRepository.findRandomUnassignedForUpdate()
                    .orElseThrow(() -> new NotFoundException("No daily games available"));
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