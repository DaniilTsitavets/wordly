package com.wordly.backend.controller;

import com.wordly.backend.dto.SubtopicDetailResponse;
import com.wordly.backend.dto.SubtopicWordsResponse;
import com.wordly.backend.service.SubtopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subtopics")
@RequiredArgsConstructor
public class SubtopicController {

    private final SubtopicService subtopicService;

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

    private boolean isGuest(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_GUEST".equals(a.getAuthority()));
    }
}