package com.wordly.backend.controller.admin;

import com.wordly.backend.dto.admin.AdminBulkWordsRequest;
import com.wordly.backend.dto.admin.AdminBulkWordsResponse;
import com.wordly.backend.dto.admin.AdminWordRequest;
import com.wordly.backend.dto.admin.AdminWordResponse;
import com.wordly.backend.service.admin.AdminWordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/words")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminWordController {

    private final AdminWordService adminWordService;

    @GetMapping
    public List<AdminWordResponse> listBySubtopic(@RequestParam("subtopic_id") Long subtopicId) {
        return adminWordService.listBySubtopic(subtopicId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminWordResponse create(@Valid @RequestBody AdminWordRequest request) {
        return adminWordService.create(request);
    }

    @PutMapping("/{wordId}")
    public AdminWordResponse update(
            @PathVariable Long wordId,
            @Valid @RequestBody AdminWordRequest request
    ) {
        return adminWordService.update(wordId, request);
    }

    @DeleteMapping("/{wordId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long wordId) {
        adminWordService.delete(wordId);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminBulkWordsResponse bulkCreate(@Valid @RequestBody AdminBulkWordsRequest request) {
        return adminWordService.bulkCreate(request);
    }
}