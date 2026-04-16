package com.wordly.backend.exception;

public class GuestOperationNotAllowedException extends RuntimeException {
    public GuestOperationNotAllowedException(String message) {
        super(message);
    }
}