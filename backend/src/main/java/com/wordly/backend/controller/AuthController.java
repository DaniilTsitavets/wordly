package com.wordly.backend.controller;

import com.wordly.backend.dto.AuthResponse;
import com.wordly.backend.dto.LoginRequest;
import com.wordly.backend.dto.OAuthCallbackRequest;
import com.wordly.backend.dto.RegisterRequest;
import com.wordly.backend.service.AuthService;
import com.wordly.backend.service.OAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OAuthService oAuthService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/guest")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse guest() {
        return authService.loginAsGuest();
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authService.logout(authHeader.substring(7));
        }
    }

    @PostMapping("/oauth/google")
    public AuthResponse oauthGoogle(@Valid @RequestBody OAuthCallbackRequest request) {
        return oAuthService.loginWithGoogle(request.code(), request.redirectUri());
    }
}
