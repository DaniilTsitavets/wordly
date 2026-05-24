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
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

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

    @Transactional
    public AuthResponse loginWithGoogle(String code, String redirectUri) {
        String accessToken = exchangeGoogleCode(code, redirectUri);
        Map<String, Object> userInfo = fetchGoogleUserInfo(accessToken);

        String oauthId = String.valueOf(userInfo.get("id"));
        String email = (String) userInfo.get("email");
        String name = (String) userInfo.getOrDefault("given_name", "");
        String surname = (String) userInfo.getOrDefault("family_name", "");

        User user = findOrCreateOAuthUser("google", oauthId, email, name, surname);
        log.info("Google OAuth login: userId={}", user.getId());
        return toAuthResponse(user);
    }

    private String exchangeGoogleCode(String code, String redirectUri) {
        Map<String, Object> body = Map.of(
                "code", code,
                "client_id", oAuthProperties.getGoogle().getClientId(),
                "client_secret", oAuthProperties.getGoogle().getClientSecret(),
                "redirect_uri", redirectUri,
                "grant_type", "authorization_code"
        );

        Map<String, Object> response = restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return (String) response.get("access_token");
    }

    private Map<String, Object> fetchGoogleUserInfo(String accessToken) {
        return restClient.get()
                .uri("https://www.googleapis.com/oauth2/v2/userinfo")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
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
        return userRepository.save(user);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.isGuest(), user.getRole());
        return new AuthResponse(token, UserProfileResponse.from(user));
    }
}