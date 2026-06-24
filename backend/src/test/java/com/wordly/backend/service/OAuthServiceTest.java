package com.wordly.backend.service;

import com.wordly.backend.config.OAuthProperties;
import com.wordly.backend.dto.AuthResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.Role;
import com.wordly.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("OAuthService")
class OAuthServiceTest {

    @Mock OAuthProperties oAuthProperties;
    @Mock UserRepository userRepository;
    @Mock JwtService jwtService;
    @Mock RestClient restClient;
    @Mock StreakService streakService;
    @InjectMocks OAuthService service;

    @Mock RestClient.RequestBodyUriSpec postUriSpec;
    @Mock RestClient.RequestBodySpec postBodySpec;
    @Mock RestClient.ResponseSpec postResponseSpec;
    @Mock RestClient.RequestHeadersUriSpec<?> getUriSpec;
    @Mock RestClient.RequestHeadersSpec<?> getHeadersSpec;
    @Mock RestClient.ResponseSpec getResponseSpec;

    private OAuthProperties.Provider googleProvider;

    @BeforeEach
    void setUp() {
        googleProvider = new OAuthProperties.Provider();
        googleProvider.setClientId("client-id");
        googleProvider.setClientSecret("client-secret");
        when(oAuthProperties.getGoogle()).thenReturn(googleProvider);
    }

    private User user(long id) {
        return User.builder().id(id).name("John").surname("Doe")
                .email("john@example.com").guest(false).role(Role.USER)
                .streak(0).gems(0).build();
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private void stubTokenExchange(Map<String, Object> tokenResponse) {
        doReturn(postUriSpec).when(restClient).post();
        doReturn(postBodySpec).when(postUriSpec).uri(anyString());
        doReturn(postBodySpec).when(postBodySpec).contentType(any());
        doReturn(postBodySpec).when(postBodySpec).body(any(Object.class));
        doReturn(postResponseSpec).when(postBodySpec).retrieve();
        doReturn(tokenResponse).when(postResponseSpec).body(any(ParameterizedTypeReference.class));
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private void stubUserInfo(Map<String, Object> userInfo) {
        doReturn(getUriSpec).when(restClient).get();
        doReturn(getHeadersSpec).when(getUriSpec).uri(anyString());
        doReturn(getHeadersSpec).when(getHeadersSpec).header(anyString(), anyString());
        doReturn(getResponseSpec).when(getHeadersSpec).retrieve();
        doReturn(userInfo).when(getResponseSpec).body(any(ParameterizedTypeReference.class));
    }

    @Nested @DisplayName("loginWithGoogle — config validation")
    class ConfigValidation {

        @Test @DisplayName("throws IllegalStateException when clientId is blank")
        void throwsWhenClientIdBlank() {
            googleProvider.setClientId("");

            assertThatThrownBy(() -> service.loginWithGoogle("code", "http://localhost"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("not configured");
        }

        @Test @DisplayName("throws IllegalStateException when clientSecret is blank")
        void throwsWhenClientSecretBlank() {
            googleProvider.setClientSecret("");

            assertThatThrownBy(() -> service.loginWithGoogle("code", "http://localhost"))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested @DisplayName("loginWithGoogle — token exchange")
    class TokenExchange {

        @Test @DisplayName("throws when token response has no access_token")
        void throwsWhenNoAccessToken() {
            stubTokenExchange(Map.of("error", "invalid_grant"));

            assertThatThrownBy(() -> service.loginWithGoogle("bad-code", "http://localhost"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("No access token");
        }

        @Test @DisplayName("throws when token response is null")
        @SuppressWarnings({"unchecked", "rawtypes"})
        void throwsWhenTokenResponseNull() {
            doReturn(postUriSpec).when(restClient).post();
            doReturn(postBodySpec).when(postUriSpec).uri(anyString());
            doReturn(postBodySpec).when(postBodySpec).contentType(any());
            doReturn(postBodySpec).when(postBodySpec).body(any(Object.class));
            doReturn(postResponseSpec).when(postBodySpec).retrieve();
            doReturn(null).when(postResponseSpec).body(any(ParameterizedTypeReference.class));

            assertThatThrownBy(() -> service.loginWithGoogle("code", "http://localhost"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test @DisplayName("throws when Google user info missing id field")
        void throwsWhenUserInfoHasNoId() {
            stubTokenExchange(Map.of("access_token", "tok"));
            stubUserInfo(Map.of("email", "john@example.com"));

            assertThatThrownBy(() -> service.loginWithGoogle("code", "http://localhost"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("user id");
        }
    }

    @Nested @DisplayName("loginWithGoogle — user lookup")
    class UserLookup {

        @Test @DisplayName("returns token for existing user found by oauthId")
        void existingUserByOauthId() {
            stubTokenExchange(Map.of("access_token", "tok"));
            stubUserInfo(Map.of("id", "google-123", "email", "john@example.com",
                    "given_name", "John", "family_name", "Doe"));

            User existing = user(1L);
            when(userRepository.findByOauthProviderAndOauthId("google", "google-123"))
                    .thenReturn(Optional.of(existing));
            when(jwtService.generateToken(1L, false, Role.USER)).thenReturn("jwt-token");
            when(streakService.currentStreak(existing)).thenReturn(5);

            AuthResponse result = service.loginWithGoogle("code", "http://localhost");

            assertThat(result.accessToken()).isEqualTo("jwt-token");
            verify(userRepository, never()).save(any());
        }

        @Test @DisplayName("links oauth to existing user found by email")
        void linksByEmail() {
            stubTokenExchange(Map.of("access_token", "tok"));
            stubUserInfo(Map.of("id", "google-456", "email", "john@example.com"));

            User existing = user(2L);
            when(userRepository.findByOauthProviderAndOauthId("google", "google-456"))
                    .thenReturn(Optional.empty());
            when(userRepository.findByEmail("john@example.com"))
                    .thenReturn(Optional.of(existing));
            when(userRepository.save(existing)).thenReturn(existing);
            when(jwtService.generateToken(2L, false, Role.USER)).thenReturn("jwt-linked");
            when(streakService.currentStreak(existing)).thenReturn(0);

            AuthResponse result = service.loginWithGoogle("code", "http://localhost");

            assertThat(result.accessToken()).isEqualTo("jwt-linked");
            assertThat(existing.getOauthId()).isEqualTo("google-456");
        }

        @Test @DisplayName("creates new user when no existing match")
        void createsNewUser() {
            stubTokenExchange(Map.of("access_token", "tok"));
            stubUserInfo(Map.of("id", "google-789", "email", "new@example.com",
                    "given_name", "Jane", "family_name", "Smith"));

            User created = user(3L);
            when(userRepository.findByOauthProviderAndOauthId("google", "google-789"))
                    .thenReturn(Optional.empty());
            when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenReturn(created);
            when(jwtService.generateToken(3L, false, Role.USER)).thenReturn("jwt-new");
            when(streakService.currentStreak(created)).thenReturn(0);

            AuthResponse result = service.loginWithGoogle("code", "http://localhost");

            assertThat(result.accessToken()).isEqualTo("jwt-new");
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertThat(captor.getValue().getName()).isEqualTo("Jane");
        }

        @Test @DisplayName("retries lookup on DataIntegrityViolationException (race condition)")
        void handlesRaceConditionOnCreate() {
            stubTokenExchange(Map.of("access_token", "tok"));
            stubUserInfo(Map.of("id", "google-race", "email", "race@example.com"));

            User raceUser = user(5L);
            when(userRepository.findByOauthProviderAndOauthId("google", "google-race"))
                    .thenReturn(Optional.empty())
                    .thenReturn(Optional.of(raceUser));
            when(userRepository.findByEmail("race@example.com")).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class)))
                    .thenThrow(new DataIntegrityViolationException("duplicate"));
            when(jwtService.generateToken(5L, false, Role.USER)).thenReturn("jwt-race");
            when(streakService.currentStreak(raceUser)).thenReturn(0);

            AuthResponse result = service.loginWithGoogle("code", "http://localhost");

            assertThat(result.accessToken()).isEqualTo("jwt-race");
        }

        @Test @DisplayName("does not link guest user found by email")
        void doesNotLinkGuestUser() {
            stubTokenExchange(Map.of("access_token", "tok"));
            stubUserInfo(Map.of("id", "google-g", "email", "guest@example.com"));

            User guestUser = User.builder().id(10L).guest(true).role(Role.USER).gems(0).streak(0).build();
            User newUser = user(11L);
            when(userRepository.findByOauthProviderAndOauthId("google", "google-g"))
                    .thenReturn(Optional.empty());
            when(userRepository.findByEmail("guest@example.com")).thenReturn(Optional.of(guestUser));
            when(userRepository.save(any(User.class))).thenReturn(newUser);
            when(jwtService.generateToken(11L, false, Role.USER)).thenReturn("jwt-skip-guest");
            when(streakService.currentStreak(newUser)).thenReturn(0);

            service.loginWithGoogle("code", "http://localhost");

            verify(userRepository, never()).save(guestUser);
        }
    }
}