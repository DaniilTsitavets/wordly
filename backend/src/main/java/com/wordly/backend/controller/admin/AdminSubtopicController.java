package com.wordly.backend.controller.admin;

import com.wordly.backend.dto.admin.AdminSubtopicRequest;
import com.wordly.backend.dto.admin.AdminSubtopicResponse;
import com.wordly.backend.service.admin.AdminSubtopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/subtopics")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminSubtopicController {

    private final AdminSubtopicService adminSubtopicService;

    @GetMapping
    public List<AdminSubtopicResponse> listByTopic(@RequestParam("topic_id") Long topicId) {
        return adminSubtopicService.listByTopic(topicId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminSubtopicResponse create(@Valid @RequestBody AdminSubtopicRequest request) {
        return adminSubtopicService.create(request);
    }

    @PutMapping("/{subtopicId}")
    public AdminSubtopicResponse update(
            @PathVariable Long subtopicId,
            @Valid @RequestBody AdminSubtopicRequest request
    ) {
        return adminSubtopicService.update(subtopicId, request);
    }

    @DeleteMapping("/{subtopicId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long subtopicId) {
        adminSubtopicService.delete(subtopicId);
    }
}