package com.wordly.backend.exception;

public class LevelLockedException extends RuntimeException {
    public LevelLockedException(String message) {
        super(message);
    }
}
