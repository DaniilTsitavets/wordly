package com.wordly.backend.dto.admin;

import java.util.List;

public record AdminUsersPageResponse(
        long total,
        int page,
        int limit,
        List<AdminUserResponse> users
) {}