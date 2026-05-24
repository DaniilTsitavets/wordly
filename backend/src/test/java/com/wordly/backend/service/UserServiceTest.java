package com.wordly.backend.service;

import com.wordly.backend.dto.UpdateUserProfileRequest;
import com.wordly.backend.dto.UserProfileResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.ColorTheme;
import com.wordly.backend.exception.EmailAlreadyExistsException;
import com.wordly.backend.exception.GuestOperationNotAllowedException;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User regularUser(long id) {
        return User.builder()
                .id(id)
                .name("Alex")
                .surname("Smith")
                .email("alex@example.com")
                .guest(false)
                .colorTheme("system")
                .interfaceLanguage("ru")
                .dailyGoalMin(10)
                .notificationsEnabled(true)
                .gems(0)
                .streak(0)
                .build();
    }

    @Nested
    @DisplayName("getCurrentUserProfile")
    class GetCurrentUserProfile {

        @Test
        @DisplayName("should return profile DTO for existing user")
        void shouldReturnProfile() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UserProfileResponse response = userService.getCurrentUserProfile(1L);

            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.email()).isEqualTo("alex@example.com");
            assertThat(response.isGuest()).isFalse();
            assertThat(response.gems()).isZero();
        }

        @Test
        @DisplayName("should throw NotFoundException when user does not exist")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getCurrentUserProfile(99L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("updateCurrentUserProfile")
    class UpdateCurrentUserProfile {

        @Test
        @DisplayName("should throw GuestOperationNotAllowedException when user is a guest")
        void shouldThrowForGuest() {
            User guest = User.builder().id(1L).guest(true).colorTheme("system").build();
            when(userRepository.findById(1L)).thenReturn(Optional.of(guest));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    "New", null, null, null, null, null, null, null, null
            );

            assertThatThrownBy(() -> userService.updateCurrentUserProfile(1L, request))
                    .isInstanceOf(GuestOperationNotAllowedException.class);
        }

        @Test
        @DisplayName("should update name and surname, trimming whitespace")
        void shouldUpdateNameAndSurname() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    "  NewName  ", "  NewSurname  ", null, null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getName()).isEqualTo("NewName");
            assertThat(user.getSurname()).isEqualTo("NewSurname");
        }

        @Test
        @DisplayName("should normalize and update email when it differs from current")
        void shouldNormalizeAndUpdateEmail() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmailAndIdNot("newemail@example.com", 1L)).thenReturn(false);

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, "  NEWEMAIL@Example.COM  ", null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getEmail()).isEqualTo("newemail@example.com");
        }

        @Test
        @DisplayName("should throw EmailAlreadyExistsException when new email belongs to another user")
        void shouldThrowWhenEmailTakenByOther() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmailAndIdNot("taken@example.com", 1L)).thenReturn(true);

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, "taken@example.com", null, null, null, null, null, null
            );

            assertThatThrownBy(() -> userService.updateCurrentUserProfile(1L, request))
                    .isInstanceOf(EmailAlreadyExistsException.class);
        }

        @Test
        @DisplayName("should not check for duplicate email when the email is unchanged")
        void shouldSkipDuplicateCheckWhenEmailUnchanged() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, "alex@example.com", null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            verify(userRepository, never()).existsByEmailAndIdNot(any(), any());
        }

        @Test
        @DisplayName("should encode and save new password when a non-blank password is provided")
        void shouldUpdatePassword() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(passwordEncoder.encode("newpassword")).thenReturn("new-hash");

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, null, "newpassword", null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        }

        @Test
        @DisplayName("should not update password when the provided value is blank")
        void shouldNotUpdatePasswordWhenBlank() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, null, "   ", null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            verify(passwordEncoder, never()).encode(anyString());
            assertThat(user.getPasswordHash()).isNull();
        }

        @Test
        @DisplayName("should update settings: language, daily goal, notifications, and color theme")
        void shouldUpdateSettings() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, null, null, "en", 30, null, false, ColorTheme.DARK
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getInterfaceLanguage()).isEqualTo("en");
            assertThat(user.getDailyGoalMin()).isEqualTo(30);
            assertThat(user.getNotificationsEnabled()).isFalse();
            assertThat(user.getColorTheme()).isEqualTo("dark");
        }

        @Test
        @DisplayName("should not modify fields when all request values are null")
        void shouldLeaveFieldsUnchangedWhenRequestIsEmpty() {
            User user = regularUser(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                    null, null, null, null, null, null, null, null, null
            );

            userService.updateCurrentUserProfile(1L, request);

            assertThat(user.getName()).isEqualTo("Alex");
            assertThat(user.getSurname()).isEqualTo("Smith");
            assertThat(user.getEmail()).isEqualTo("alex@example.com");
        }
    }
}