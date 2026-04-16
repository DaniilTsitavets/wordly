package com.wordly.backend.service;

import com.wordly.backend.dto.UpdateUserProfileRequest;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.exception.EmailAlreadyExistsException;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.exception.GuestOperationNotAllowedException;
import com.wordly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = getUserOrThrow(userId);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateCurrentUserProfile(Long userId, UpdateUserProfileRequest request) {
        User user = getUserOrThrow(userId);

        if (user.isGuest()) {
            throw new GuestOperationNotAllowedException("Guest users cannot update profile");
        }

        if (request.name() != null) {
            user.setName(request.name().trim());
        }

        if (request.surname() != null) {
            user.setSurname(request.surname().trim());
        }

        if (request.email() != null) {
            String normalizedEmail = request.email().trim().toLowerCase();
            if (!normalizedEmail.equals(user.getEmail())
                    && userRepository.existsByEmailAndIdNot(normalizedEmail, user.getId())) {
                throw new EmailAlreadyExistsException("Email already registered: " + normalizedEmail);
            }
            user.setEmail(normalizedEmail);
        }

        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        if (request.interfaceLanguage() != null) {
            user.setInterfaceLanguage(request.interfaceLanguage().trim());
        }

        if (request.dailyGoalMin() != null) {
            user.setDailyGoalMin(request.dailyGoalMin());
        }

        if (request.notificationsEnabled() != null) {
            user.setNotificationsEnabled(request.notificationsEnabled());
        }

        if (request.colorTheme() != null) {
            user.setColorTheme(request.colorTheme().getValue());
        }

        User saved = userRepository.save(user);
        return UserProfileResponse.from(saved);
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }
}