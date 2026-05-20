package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminUserResponse;
import com.wordly.backend.dto.admin.AdminUsersPageResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final int MAX_PAGE_SIZE = 200;

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminUsersPageResponse list(int page, int limit) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);

        PageRequest pageable = PageRequest.of(safePage - 1, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> result = userRepository.findAll(pageable);

        return new AdminUsersPageResponse(
                result.getTotalElements(),
                safePage,
                safeLimit,
                result.getContent().stream().map(AdminUserResponse::of).toList()
        );
    }
}