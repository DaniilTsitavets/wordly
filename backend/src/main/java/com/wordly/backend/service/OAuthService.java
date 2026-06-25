package com.wordly.backend.service;

import com.wordly.backend.config.OAuthProperties;
import com.wordly.backend.dto.AuthResponse;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.Role;
import com.wordly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthService {

    private final OAuthProperties oAuthProperties;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RestClient restClient;
    private final StreakService streakService;

    @Transactional
    public AuthResponse loginWithGoogle(String code, String redirectUri) {
        validateGoogleConfig();
        String accessToken = exchangeGoogleCode(code, redirectUri);
        Map<String, Object> userInfo = fetchGoogleUserInfo(accessToken);

        Object idValue = userInfo.get("id");
        if (idValue == null) {
            throw new IllegalArgumentException("Google did not return a user id");
        }
        String oauthId = String.valueOf(idValue);
        String email = (String) userInfo.get("email");
        String name = (String) userInfo.getOrDefault("given_name", "");
        String surname = (String) userInfo.getOrDefault("family_name", "");

        User user = findOrCreateOAuthUser("google", oauthId, email, name, surname);
        log.info("Google OAuth login: userId={}", user.getId());
        return toAuthResponse(user);
    }

    private void validateGoogleConfig() {
        OAuthProperties.Provider google = oAuthProperties.getGoogle();
        if (!StringUtils.hasText(google.getClientId()) || !StringUtils.hasText(google.getClientSecret())) {
            throw new IllegalStateException("Google OAuth is not configured on this server");
        }
    }

    private String exchangeGoogleCode(String code, String redirectUri) {
        Map<String, Object> body = Map.of(
                "code", code,
                "client_id", oAuthProperties.getGoogle().getClientId(),
                "client_secret", oAuthProperties.getGoogle().getClientSecret(),
                "redirect_uri", redirectUri,
                "grant_type", "authorization_code"
        );

        Map<String, Object> response;
        try {
            response = restClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (RestClientResponseException e) {
            log.warn("Google token exchange failed: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalArgumentException("Google authentication failed. The authorization code may be invalid or expired.");
        }

        if (response == null || !response.containsKey("access_token")) {
            log.warn("Google token response missing access_token: {}", response);
            throw new IllegalArgumentException("Google authentication failed. No access token received.");
        }
        return (String) response.get("access_token");
    }

    private Map<String, Object> fetchGoogleUserInfo(String accessToken) {
        try {
            Map<String, Object> userInfo = restClient.get()
                    .uri("https://www.googleapis.com/oauth2/v2/userinfo")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            if (userInfo == null) {
                throw new IllegalArgumentException("Google returned empty user info");
            }
            return userInfo;
        } catch (RestClientResponseException e) {
            log.warn("Google userinfo fetch failed: status={}", e.getStatusCode());
            throw new IllegalArgumentException("Failed to fetch user info from Google.");
        }
    }

    private User findOrCreateOAuthUser(String provider, String oauthId, String email, String name, String surname) {
        Optional<User> byOAuthId = userRepository.findByOauthProviderAndOauthId(provider, oauthId);
        if (byOAuthId.isPresent()) {
            return byOAuthId.get();
        }

        if (email != null) {
            Optional<User> byEmail = userRepository.findByEmail(email.toLowerCase())
                    .filter(u -> !u.isGuest());
            if (byEmail.isPresent()) {
                User existing = byEmail.get();
                existing.setOauthProvider(provider);
                existing.setOauthId(oauthId);
                return userRepository.save(existing);
            }
        }

        User user = User.builder()
                .name(name)
                .surname(surname)
                .email(email != null ? email.toLowerCase() : null)
                .oauthProvider(provider)
                .oauthId(oauthId)
                .guest(false)
                .role(Role.USER)
                .build();
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Race condition: concurrent login created the user between our check and save
            return userRepository.findByOauthProviderAndOauthId(provider, oauthId)
                    .orElseThrow(() -> new IllegalStateException("OAuth user conflict but not found", e));
        }
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.isGuest(), user.getRole());
        return new AuthResponse(token, UserProfileResponse.from(user, streakService.currentStreak(user)));
    }
}