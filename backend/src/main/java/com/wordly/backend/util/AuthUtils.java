package com.wordly.backend.util;

import org.springframework.security.core.Authentication;

public final class AuthUtils {

    private static final String ROLE_GUEST = "ROLE_GUEST";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";

    private AuthUtils() {
        // prevent instantiation
    }

    public static boolean isGuest(Authentication authentication) {
        return hasAuthority(authentication, ROLE_GUEST);
    }

    public static boolean isAdmin(Authentication authentication) {
        return hasAuthority(authentication, ROLE_ADMIN);
    }

    private static boolean hasAuthority(Authentication authentication, String authority) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(a -> authority.equals(a.getAuthority()));
    }
}
