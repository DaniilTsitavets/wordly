package com.wordly.backend.service;

import com.wordly.backend.dto.AuthResponse;
import com.wordly.backend.dto.LoginRequest;
import com.wordly.backend.dto.RegisterRequest;
import com.wordly.backend.entity.User;
import com.wordly.backend.exception.EmailAlreadyExistsException;
import com.wordly.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TokenBlacklistService tokenBlacklistService;
    @Mock
    private StreakService streakService;

    @InjectMocks
    private AuthService authService;

    @Nested
    @DisplayName("register")
    class Register {

        @Test
        @DisplayName("should register user and return auth response")
        void shouldRegisterUser() {
            RegisterRequest request = new RegisterRequest("Alex", "Smith", "user@example.com", "password123");
            User saved = User.builder().id(1L).name("Alex").surname("Smith").email("user@example.com").guest(false).build();

            when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(saved);
            when(passwordEncoder.encode(anyString())).thenReturn("hashed");
            when(jwtService.generateToken(anyLong(), anyBoolean(), any())).thenReturn("token");

            AuthResponse response = authService.register(request);

            assertThat(response.accessToken()).isEqualTo("token");
            assertThat(response.user().email()).isEqualTo("user@example.com");
        }

        @Test
        @DisplayName("should normalize email before saving")
        void shouldNormalizeEmail() {
            RegisterRequest request = new RegisterRequest("Alex", "Smith", "  USER@Example.COM  ", "password123");
            User saved = User.builder().id(1L).email("user@example.com").guest(false).build();

            when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(saved);
            when(passwordEncoder.encode(anyString())).thenReturn("hashed");
            when(jwtService.generateToken(anyLong(), anyBoolean(), any())).thenReturn("token");

            authService.register(request);

            verify(userRepository).existsByEmail("user@example.com");
            verify(userRepository).save(argThat(u -> "user@example.com".equals(u.getEmail())));
        }

        @Test
        @DisplayName("should throw EmailAlreadyExistsException when email is taken")
        void shouldThrowWhenEmailTaken() {
            RegisterRequest request = new RegisterRequest("Alex", "Smith", "user@example.com", "password123");
            when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(EmailAlreadyExistsException.class)
                    .hasMessageContaining("user@example.com");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("should return auth response on valid credentials")
        void shouldLoginWithValidCredentials() {
            LoginRequest request = new LoginRequest("user@example.com", "password123");
            User user = User.builder().id(1L).email("user@example.com").passwordHash("hashed").guest(false).build();

            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
            when(jwtService.generateToken(eq(1L), eq(false), any())).thenReturn("token");

            AuthResponse response = authService.login(request);

            assertThat(response.accessToken()).isEqualTo("token");
        }

        @Test
        @DisplayName("should normalize email before lookup")
        void shouldNormalizeEmailOnLogin() {
            LoginRequest request = new LoginRequest("  USER@Example.COM  ", "password123");
            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);

            verify(userRepository).findByEmail("user@example.com");
        }

        @Test
        @DisplayName("should throw BadCredentialsException when user not found")
        void shouldThrowWhenUserNotFound() {
            LoginRequest request = new LoginRequest("unknown@example.com", "password123");
            when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("should throw BadCredentialsException when password is wrong")
        void shouldThrowWhenPasswordWrong() {
            LoginRequest request = new LoginRequest("user@example.com", "wrongpassword");
            User user = User.builder().id(1L).email("user@example.com").passwordHash("hashed").guest(false).build();

            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("wrongpassword", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("should throw BadCredentialsException when account is a guest")
        void shouldThrowWhenAccountIsGuest() {
            LoginRequest request = new LoginRequest("user@example.com", "password123");
            User guest = User.builder().id(1L).guest(true).build();

            when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(guest));

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }
    }

    @Nested
    @DisplayName("loginAsGuest")
    class LoginAsGuest {

        @Test
        @DisplayName("should create guest user and return auth response")
        void shouldCreateGuestSession() {
            User saved = User.builder().id(99L).guest(true).build();

            when(userRepository.save(any(User.class))).thenReturn(saved);
            when(jwtService.generateToken(eq(99L), eq(true), any())).thenReturn("guest-token");

            AuthResponse response = authService.loginAsGuest();

            assertThat(response.accessToken()).isEqualTo("guest-token");
            assertThat(response.user().isGuest()).isTrue();
            verify(userRepository).save(argThat(User::isGuest));
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("should delegate token revocation to blacklist service")
        void shouldRevokeToken() {
            authService.logout("some-token");
            verify(tokenBlacklistService).revoke("some-token");
        }
    }
}