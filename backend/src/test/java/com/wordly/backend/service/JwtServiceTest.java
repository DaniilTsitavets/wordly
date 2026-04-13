package com.wordly.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        // same default secret as application.yaml
        jwtService = new JwtService(
                "dev-secret-change-in-production-min-32-chars",
                86400000L
        );
    }

    @Test
    void generateAndValidate_regularUser() {
        String token = jwtService.generateToken(42L, false);
        System.out.println("USER token: " + token);

        assertThat(jwtService.isTokenValid(token)).isTrue();
        assertThat(jwtService.extractUserId(token)).isEqualTo(42L);
        assertThat(jwtService.extractIsGuest(token)).isFalse();
    }

    @Test
    void generateAndValidate_guest() {
        String token = jwtService.generateToken(99L, true);
        System.out.println("GUEST token: " + token);

        assertThat(jwtService.isTokenValid(token)).isTrue();
        assertThat(jwtService.extractUserId(token)).isEqualTo(99L);
        assertThat(jwtService.extractIsGuest(token)).isTrue();
    }

    @Test
    void invalidToken_returnsFalse() {
        assertThat(jwtService.isTokenValid("not.a.token")).isFalse();
        assertThat(jwtService.isTokenValid("")).isFalse();
    }

    @Test
    void expiredToken_returnsFalse() {
        JwtService shortLived = new JwtService(
                "dev-secret-change-in-production-min-32-chars",
                -1000L
        );
        String token = shortLived.generateToken(1L, false);
        assertThat(shortLived.isTokenValid(token)).isFalse();
    }
}
