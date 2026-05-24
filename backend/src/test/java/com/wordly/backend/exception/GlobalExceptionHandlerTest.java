package com.wordly.backend.exception;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.web.client.ResourceAccessException;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("handleNotFound: NotFoundException → 404 NOT_FOUND")
    void handleNotFoundException() {
        ErrorResponse response = handler.handleNotFound(new NotFoundException("item missing"));
        assertThat(response.code()).isEqualTo("NOT_FOUND");
        assertThat(response.message()).isEqualTo("item missing");
    }

    @Test
    @DisplayName("handleNotFound: EntityNotFoundException → 404 NOT_FOUND")
    void handleEntityNotFoundException() {
        ErrorResponse response = handler.handleNotFound(new EntityNotFoundException("entity gone"));
        assertThat(response.code()).isEqualTo("NOT_FOUND");
    }

    @Test
    @DisplayName("handleEmailExists: EmailAlreadyExistsException → 409 with EMAIL_ALREADY_EXISTS")
    void handleEmailAlreadyExists() {
        ResponseEntity<ErrorResponse> responseEntity = handler.handleEmailExists(
                new EmailAlreadyExistsException("already taken")
        );
        assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(responseEntity.getBody()).isNotNull();
        assertThat(responseEntity.getBody().code()).isEqualTo("EMAIL_ALREADY_EXISTS");
        assertThat(responseEntity.getBody().message()).isEqualTo("already taken");
    }

    @Test
    @DisplayName("handleBadCredentials: BadCredentialsException → 401 INVALID_CREDENTIALS")
    void handleBadCredentials() {
        ErrorResponse response = handler.handleBadCredentials(new BadCredentialsException("bad creds"));
        assertThat(response.code()).isEqualTo("INVALID_CREDENTIALS");
    }

    @Test
    @DisplayName("handleAccessDenied: AccessDeniedException → 403 FORBIDDEN")
    void handleAccessDenied() {
        ErrorResponse response = handler.handleAccessDenied(new AccessDeniedException("no access"));
        assertThat(response.code()).isEqualTo("FORBIDDEN");
    }

    @Test
    @DisplayName("handleAuthentication: AuthenticationException → 401 UNAUTHORIZED")
    void handleAuthenticationException() {
        ErrorResponse response = handler.handleAuthentication(
                new InsufficientAuthenticationException("not authenticated")
        );
        assertThat(response.code()).isEqualTo("UNAUTHORIZED");
    }

    @Test
    @DisplayName("handleIllegalArgument: IllegalArgumentException → 400 BAD_REQUEST")
    void handleIllegalArgument() {
        ErrorResponse response = handler.handleIllegalArgument(new IllegalArgumentException("bad input"));
        assertThat(response.code()).isEqualTo("BAD_REQUEST");
    }

    @Test
    @DisplayName("handleResourceAccess: ResourceAccessException → 503 SERVICE_UNAVAILABLE")
    void handleResourceAccess() {
        ErrorResponse response = handler.handleResourceAccess(
                new ResourceAccessException("connection refused")
        );
        assertThat(response.code()).isEqualTo("SERVICE_UNAVAILABLE");
    }

    @Test
    @DisplayName("handleGeneral: any unexpected exception → 500 INTERNAL_ERROR")
    void handleGeneral() {
        ErrorResponse response = handler.handleGeneral(new RuntimeException("boom"));
        assertThat(response.code()).isEqualTo("INTERNAL_ERROR");
    }

    @Test
    @DisplayName("handleGuestForbidden: GuestOperationNotAllowedException → 403 FORBIDDEN")
    void handleGuestForbidden() {
        ErrorResponse response = handler.handleGuestForbidden(
                new GuestOperationNotAllowedException("guests cannot do this")
        );
        assertThat(response.code()).isEqualTo("FORBIDDEN");
        assertThat(response.message()).isEqualTo("guests cannot do this");
    }

    @Test
    @DisplayName("handleLevelLocked: LevelLockedException → 403 LEVEL_LOCKED")
    void handleLevelLocked() {
        ErrorResponse response = handler.handleLevelLocked(new LevelLockedException("level is locked"));
        assertThat(response.code()).isEqualTo("LEVEL_LOCKED");
    }

    @Test
    @DisplayName("handleConflict: ConflictException → 409 CONFLICT")
    void handleConflict() {
        ErrorResponse response = handler.handleConflict(new ConflictException("conflict occurred"));
        assertThat(response.code()).isEqualTo("CONFLICT");
    }
}