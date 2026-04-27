package com.wordly.backend.controller;

import com.wordly.backend.dto.VocabularyResponse;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.exception.GuestOperationNotAllowedException;
import com.wordly.backend.service.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.wordly.backend.util.AuthUtils.isGuest;

@RestController
@RequestMapping("/vocabulary")
@RequiredArgsConstructor
public class VocabularyController {

    private final VocabularyService vocabularyService;

    @GetMapping
    public VocabularyResponse getVocabulary(
            @RequestParam(required = false) WordStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        if (isGuest(authentication)) {
            throw new GuestOperationNotAllowedException("Guest users cannot access vocabulary");
        }
        return vocabularyService.getVocabulary(userId, status, page, limit);
    }
}
