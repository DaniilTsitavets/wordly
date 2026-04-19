package com.wordly.backend.controller;

import com.wordly.backend.dto.*;
import com.wordly.backend.service.LearningService;
import com.wordly.backend.service.SubtopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import static com.wordly.backend.util.AuthUtils.isGuest;

@RestController
@RequestMapping("/subtopics")
@RequiredArgsConstructor
public class SubtopicController {

    private final SubtopicService subtopicService;
    private final LearningService learningService;

    @GetMapping("/{subtopicId}")
    public SubtopicDetailResponse getSubtopicDetail(
            @PathVariable Long subtopicId,
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        return subtopicService.getSubtopicDetail(subtopicId, userId, isGuest(authentication));
    }

    @GetMapping("/{subtopicId}/words")
    public SubtopicWordsResponse getSubtopicWords(
            @PathVariable Long subtopicId,
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        return subtopicService.getSubtopicWords(subtopicId, userId, isGuest(authentication));
    }

    @GetMapping("/{subtopicId}/session")
    public SessionDataResponse getSession(
            @PathVariable Long subtopicId,
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        return learningService.getSession(subtopicId, userId, isGuest(authentication));
    }

    @PostMapping("/{subtopicId}/session/answer")
    public AnswerResultResponse submitAnswer(
            @PathVariable Long subtopicId,
            @Valid @RequestBody AnswerRequest request,
            @AuthenticationPrincipal Long userId
    ) {
        return learningService.submitAnswer(subtopicId, request, userId);
    }

    @PostMapping("/{subtopicId}/session/complete")
    public LevelCompleteResultResponse completeLevel(
            @PathVariable Long subtopicId,
            @Valid @RequestBody CompleteSessionRequest request,
            @AuthenticationPrincipal Long userId
    ) {
        return learningService.completeLevel(subtopicId, request, userId);
    }
}