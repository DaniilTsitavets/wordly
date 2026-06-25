package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminDailyGameRequest;
import com.wordly.backend.dto.admin.AdminDailyGameResponse;
import com.wordly.backend.entity.DailyGame;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.DailyGameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDailyGameService {

    private final DailyGameRepository dailyGameRepository;

    @Transactional(readOnly = true)
    public List<AdminDailyGameResponse> list() {
        return dailyGameRepository.findAll().stream()
                .map(AdminDailyGameResponse::of)
                .toList();
    }

    @Transactional
    public AdminDailyGameResponse create(AdminDailyGameRequest request) {
        DailyGame game = DailyGame.builder()
                .idiom(request.idiom().trim())
                .option1(request.option1().trim())
                .option2(request.option2().trim())
                .option3(request.option3().trim())
                .option4(request.option4().trim())
                .correctOption(request.correctOption())
                .build();
        DailyGame saved = dailyGameRepository.save(game);
        log.info("Admin created daily_game id={}", saved.getId());
        return AdminDailyGameResponse.of(saved);
    }

    @Transactional
    public AdminDailyGameResponse update(Long id, AdminDailyGameRequest request) {
        DailyGame game = dailyGameRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Daily game not found: " + id));

        game.setIdiom(request.idiom().trim());
        game.setOption1(request.option1().trim());
        game.setOption2(request.option2().trim());
        game.setOption3(request.option3().trim());
        game.setOption4(request.option4().trim());
        game.setCorrectOption(request.correctOption());

        DailyGame saved = dailyGameRepository.save(game);
        log.info("Admin updated daily_game id={}", saved.getId());
        return AdminDailyGameResponse.of(saved);
    }

    @Transactional
    public void delete(Long id) {
        DailyGame game = dailyGameRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Daily game not found: " + id));
        dailyGameRepository.delete(game);
        log.info("Admin deleted daily_game id={}", id);
    }
}