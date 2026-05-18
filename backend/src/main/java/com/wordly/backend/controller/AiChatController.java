package com.wordly.backend.controller;

import com.wordly.backend.dto.AiChatRequest;
import com.wordly.backend.dto.AiChatResponse;
import com.wordly.backend.service.AiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai/chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping
    public AiChatResponse chat(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal Long userId
    ) {
        return aiChatService.chat(request);
    }
}