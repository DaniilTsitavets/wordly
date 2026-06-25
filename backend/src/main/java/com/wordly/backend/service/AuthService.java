package com.wordly.backend.service;

import com.wordly.backend.dto.AuthResponse;
import com.wordly.backend.dto.LoginRequest;
import com.wordly.backend.dto.RegisterRequest;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.Role;
import com.wordly.backend.exception.EmailAlreadyExistsException;
import com.wordly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;
    private final StreakService streakService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Registration attempt with already registered email: {}", maskEmail(normalizedEmail));
            throw new EmailAlreadyExistsException("Email already registered: " + normalizedEmail);
        }

        User user = User.builder()
                .name(request.name().trim())
                .surname(request.surname().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .guest(false)
                .role(Role.USER)
                .build();

        User saved = userRepository.save(user);
        log.info("User registered: id={}", saved.getId());
        return toAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .filter(u -> !u.isGuest())
                .orElseThrow(() -> {
                    log.warn("Login failed — user not found: {}", maskEmail(normalizedEmail));
                    return new BadCredentialsException("Invalid credentials");
                });

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Login failed — wrong password: userId={}", user.getId());
            throw new BadCredentialsException("Invalid credentials");
        }

        log.info("User logged in: id={}", user.getId());
        return toAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginAsGuest() {
        User guest = User.builder()
                .guest(true)
                .role(Role.USER)
                .build();

        User saved = userRepository.save(guest);
        log.info("Guest session created: id={}", saved.getId());
        return toAuthResponse(saved);
    }

    public void logout(String token) {
        tokenBlacklistService.revoke(token);
        log.info("Token revoked");
    }

    private static String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) return "***@" + (at >= 0 ? email.substring(at + 1) : "");
        return email.charAt(0) + "***@" + email.substring(at + 1);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.isGuest(), user.getRole());
        return new AuthResponse(token, UserProfileResponse.from(user, streakService.currentStreak(user)));
    }
}
