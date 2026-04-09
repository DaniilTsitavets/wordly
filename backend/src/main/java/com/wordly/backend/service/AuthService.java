package com.wordly.backend.service;

import com.wordly.backend.dto.AuthResponse;
import com.wordly.backend.dto.LoginRequest;
import com.wordly.backend.dto.RegisterRequest;
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

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.email());
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .guest(false)
                .build();

        User saved = userRepository.save(user);
        return new AuthResponse(saved.getId(), jwtService.generateToken(saved.getId(), false));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .filter(u -> !u.isGuest())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return new AuthResponse(user.getId(), jwtService.generateToken(user.getId(), false));
    }

    @Transactional
    public AuthResponse loginAsGuest() {
        User guest = User.builder()
                .guest(true)
                .build();

        User saved = userRepository.save(guest);
        return new AuthResponse(saved.getId(), jwtService.generateToken(saved.getId(), true));
    }
}