package com.wordly.backend.controller.admin;

import com.wordly.backend.dto.admin.AdminDailyGameRequest;
import com.wordly.backend.dto.admin.AdminDailyGameResponse;
import com.wordly.backend.service.admin.AdminDailyGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/daily-games")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminDailyGameController {

    private final AdminDailyGameService adminDailyGameService;

    @GetMapping
    public List<AdminDailyGameResponse> list() {
        return adminDailyGameService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminDailyGameResponse create(@Valid @RequestBody AdminDailyGameRequest request) {
        return adminDailyGameService.create(request);
    }

    @PutMapping("/{id}")
    public AdminDailyGameResponse update(
            @PathVariable Long id,
            @Valid @RequestBody AdminDailyGameRequest request
    ) {
        return adminDailyGameService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        adminDailyGameService.delete(id);
    }
}