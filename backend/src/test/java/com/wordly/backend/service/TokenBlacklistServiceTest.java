package com.wordly.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TokenBlacklistService")
class TokenBlacklistServiceTest {

    @Mock
    private JwtService jwtService;

    private TokenBlacklistService tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistService(jwtService);
    }

    @Nested
    @DisplayName("isRevoked")
    class IsRevoked {

        @Test
        @DisplayName("should return false for token that was never revoked")
        void shouldReturnFalseForNonRevokedToken() {
            assertThat(tokenBlacklistService.isRevoked("any-token")).isFalse();
        }

        @Test
        @DisplayName("should return true for revoked and still-valid token")
        void shouldReturnTrueForRevokedValidToken() {
            when(jwtService.isTokenValid("valid-token")).thenReturn(true);

            tokenBlacklistService.revoke("valid-token");

            assertThat(tokenBlacklistService.isRevoked("valid-token")).isTrue();
        }

        @Test
        @DisplayName("should remove expired token from blacklist and return false")
        void shouldCleanUpAndReturnFalseForExpiredToken() {
            when(jwtService.isTokenValid("expired-token")).thenReturn(false);

            tokenBlacklistService.revoke("expired-token");

            // expired token is cleaned up — JWT filter will reject it anyway
            assertThat(tokenBlacklistService.isRevoked("expired-token")).isFalse();
            // second call confirms it was actually removed from the set
            assertThat(tokenBlacklistService.isRevoked("expired-token")).isFalse();
        }
    }

    @Nested
    @DisplayName("revoke")
    class Revoke {

        @Test
        @DisplayName("should mark token as revoked")
        void shouldMarkTokenAsRevoked() {
            when(jwtService.isTokenValid("token")).thenReturn(true);

            tokenBlacklistService.revoke("token");

            assertThat(tokenBlacklistService.isRevoked("token")).isTrue();
        }

        @Test
        @DisplayName("should handle multiple different tokens independently")
        void shouldHandleMultipleTokens() {
            when(jwtService.isTokenValid("token-a")).thenReturn(true);

            tokenBlacklistService.revoke("token-a");

            assertThat(tokenBlacklistService.isRevoked("token-a")).isTrue();
            assertThat(tokenBlacklistService.isRevoked("token-b")).isFalse();
        }
    }
}