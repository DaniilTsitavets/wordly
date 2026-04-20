package com.wordly.backend.util;

import org.springframework.security.core.Authentication;

public final class AuthUtils {

    private static final String ROLE_GUEST = "ROLE_GUEST";

    private AuthUtils() {
        // prevent instantiation
    }

    public static boolean isGuest(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(a -> ROLE_GUEST.equals(a.getAuthority()));
    }
}