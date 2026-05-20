package com.wordly.backend.controller.admin;

import com.wordly.backend.dto.admin.AdminTopicRequest;
import com.wordly.backend.dto.admin.AdminTopicResponse;
import com.wordly.backend.service.admin.AdminTopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/topics")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminTopicController {

    private final AdminTopicService adminTopicService;

    @GetMapping
    public List<AdminTopicResponse> list() {
        return adminTopicService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminTopicResponse create(@Valid @RequestBody AdminTopicRequest request) {
        return adminTopicService.create(request);
    }

    @PutMapping("/{topicId}")
    public AdminTopicResponse update(
            @PathVariable Long topicId,
            @Valid @RequestBody AdminTopicRequest request
    ) {
        return adminTopicService.update(topicId, request);
    }

    @DeleteMapping("/{topicId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long topicId) {
        adminTopicService.delete(topicId);
    }
}