package com.wordly.backend.service;

import com.wordly.backend.dto.AuthResponse;
import com.wordly.backend.dto.LoginRequest;
import com.wordly.backend.dto.RegisterRequest;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.exception.EmailAlreadyExistsException;
import com.wordly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("Email already registered: " + normalizedEmail);
        }

        User user = User.builder()
                .name(request.name().trim())
                .surname(request.surname().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .guest(false)
                .build();

        User saved = userRepository.save(user);
        return toAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .filter(u -> !u.isGuest())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return toAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginAsGuest() {
        User guest = User.builder()
                .guest(true)
                .build();

        User saved = userRepository.save(guest);
        return toAuthResponse(saved);
    }

    public void logout(String token) {
        tokenBlacklistService.revoke(token);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.isGuest());
        return new AuthResponse(token, UserProfileResponse.from(user));
    }
}
