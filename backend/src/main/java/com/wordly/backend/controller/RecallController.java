package com.wordly.backend.controller;

import com.wordly.backend.dto.AnswerResultResponse;
import com.wordly.backend.dto.RecallAnswerRequest;
import com.wordly.backend.dto.RecallCompleteResponse;
import com.wordly.backend.dto.RecallWordsResponse;
import com.wordly.backend.exception.GuestOperationNotAllowedException;
import com.wordly.backend.service.RecallService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.wordly.backend.util.AuthUtils.isGuest;

@RestController
@RequestMapping("/recall")
@RequiredArgsConstructor
public class RecallController {

    private final RecallService recallService;

    @GetMapping
    public RecallWordsResponse getRecallWords(
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        if (isGuest(authentication)) {
            throw new GuestOperationNotAllowedException("Guests cannot access recall");
        }
        return recallService.getRecallWords(userId);
    }

    @PostMapping("/answer")
    public AnswerResultResponse submitAnswer(
            @Valid @RequestBody RecallAnswerRequest request,
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        if (isGuest(authentication)) {
            throw new GuestOperationNotAllowedException("Guests cannot submit recall answers");
        }
        return recallService.submitAnswer(request, userId);
    }

    @PostMapping("/complete")
    public RecallCompleteResponse completeRecall(
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        if (isGuest(authentication)) {
            throw new GuestOperationNotAllowedException("Guests cannot complete recall sessions");
        }
        return recallService.completeRecall(userId);
    }
}