package com.wordly.backend.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("AuthUtils")
class AuthUtilsTest {

    @Test
    @DisplayName("should return false when authentication is null")
    void shouldReturnFalseForNullAuthentication() {
        assertThat(AuthUtils.isGuest(null)).isFalse();
    }

    @Test
    @DisplayName("should return true when authentication has ROLE_GUEST authority")
    void shouldReturnTrueForGuestRole() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                1L, null, List.of(new SimpleGrantedAuthority("ROLE_GUEST"))
        );
        assertThat(AuthUtils.isGuest(auth)).isTrue();
    }

    @Test
    @DisplayName("should return false when authentication has ROLE_USER authority")
    void shouldReturnFalseForUserRole() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                1L, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        assertThat(AuthUtils.isGuest(auth)).isFalse();
    }

    @Test
    @DisplayName("should return false when authentication has no authorities")
    void shouldReturnFalseForEmptyAuthorities() {
        Authentication auth = new UsernamePasswordAuthenticationToken(1L, null, List.of());
        assertThat(AuthUtils.isGuest(auth)).isFalse();
    }

    @Test
    @DisplayName("should return false when authorities collection is null")
    void shouldReturnFalseWhenAuthoritiesNull() {
        Authentication auth = mock(Authentication.class);
        when(auth.getAuthorities()).thenReturn(null);
        assertThat(AuthUtils.isGuest(auth)).isFalse();
    }
}