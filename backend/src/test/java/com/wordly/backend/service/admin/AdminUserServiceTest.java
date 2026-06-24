package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminUsersPageResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminUserService")
class AdminUserServiceTest {

    @Mock UserRepository userRepository;
    @InjectMocks AdminUserService service;

    private User user(long id) {
        return User.builder().id(id).name("User " + id).guest(false).gems(0).streak(0).build();
    }

    @Test @DisplayName("returns paginated users")
    void returnsPaginatedUsers() {
        when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(user(1L), user(2L))));

        AdminUsersPageResponse result = service.list(1, 10);

        assertThat(result.total()).isEqualTo(2L);
        assertThat(result.page()).isEqualTo(1);
        assertThat(result.limit()).isEqualTo(10);
        assertThat(result.users()).hasSize(2);
    }

    @Test @DisplayName("clamps page to 1 when 0 is given")
    void clampsPageToOne() {
        when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        AdminUsersPageResponse result = service.list(0, 10);

        assertThat(result.page()).isEqualTo(1);
    }

    @Test @DisplayName("clamps limit to MAX_PAGE_SIZE (200)")
    void clampsLimitToMax() {
        when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        AdminUsersPageResponse result = service.list(1, 9999);

        assertThat(result.limit()).isEqualTo(200);
    }

    @Test @DisplayName("clamps limit to 1 when 0 is given")
    void clampsLimitToOne() {
        when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        AdminUsersPageResponse result = service.list(1, 0);

        assertThat(result.limit()).isEqualTo(1);
    }
}