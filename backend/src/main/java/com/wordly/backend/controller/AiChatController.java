package com.wordly.backend.controller;

import com.wordly.backend.dto.AiChatRequest;
import com.wordly.backend.service.AiChatService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/ai/chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;
    private final TaskExecutor aiChatExecutor;

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal Long userId,
            HttpServletResponse response
    ) {
        // Prevent buffering by intermediate proxies (nginx, AWS ALB, CloudFront)
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");

        // 120s — longer than ALB default idle timeout (60s) so ALB closes first cleanly
        SseEmitter emitter = new SseEmitter(120_000L);
        emitter.onTimeout(emitter::complete);
        emitter.onError(e -> emitter.complete());
        aiChatExecutor.execute(() -> aiChatService.streamChat(request, emitter));
        return emitter;
    }
}