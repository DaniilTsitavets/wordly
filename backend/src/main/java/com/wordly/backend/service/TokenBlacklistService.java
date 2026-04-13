package com.wordly.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory token blacklist for logout.
 * Tokens are cleared on restart — acceptable for now.
 * Replace with DB or Redis-backed store before production.
 */
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final JwtService jwtService;

    private final Set<String> revokedTokens = ConcurrentHashMap.newKeySet();

    public void revoke(String token) {
        revokedTokens.add(token);
    }

    public boolean isRevoked(String token) {
        if (!revokedTokens.contains(token)) {
            return false;
        }
        if (!jwtService.isTokenValid(token)) {
            revokedTokens.remove(token);
            return false;
        }
        return true;
    }
}