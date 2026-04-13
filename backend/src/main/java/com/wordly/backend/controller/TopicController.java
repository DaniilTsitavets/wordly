package com.wordly.backend.controller;

import com.wordly.backend.dto.TopicDetailResponse;
import com.wordly.backend.dto.TopicsResponse;
import com.wordly.backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @GetMapping
    public TopicsResponse getTopics(
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        return topicService.getTopics(userId, isGuest(authentication));
    }

    @GetMapping("/{topicId}")
    public TopicDetailResponse getTopicById(
            @PathVariable Long topicId,
            @AuthenticationPrincipal Long userId,
            Authentication authentication
    ) {
        return topicService.getTopicDetail(topicId, userId, isGuest(authentication));
    }

    private boolean isGuest(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_GUEST".equals(a.getAuthority()));
    }
}