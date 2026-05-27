package com.wordly.backend.controller;

import com.wordly.backend.dto.DailyGoalClaimResponse;
import com.wordly.backend.dto.DailyProgressResponse;
import com.wordly.backend.dto.UpdateUserProfileRequest;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse getMe(@AuthenticationPrincipal Long userId) {
        return userService.getCurrentUserProfile(userId);
    }

    @GetMapping("/me/daily-progress")
    public DailyProgressResponse getDailyProgress(@AuthenticationPrincipal Long userId) {
        return userService.getDailyProgress(userId);
    }

    @PostMapping("/me/daily-goal/claim")
    public DailyGoalClaimResponse claimDailyGoal(@AuthenticationPrincipal Long userId) {
        return userService.claimDailyGoal(userId);
    }

    @PutMapping("/me")
    public UserProfileResponse updateMe(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        return userService.updateCurrentUserProfile(userId, request);
    }
}