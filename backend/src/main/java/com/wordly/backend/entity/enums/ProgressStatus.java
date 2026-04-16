package com.wordly.backend.entity.enums;

public enum ProgressStatus {
    LOCKED("locked"),
    UNBLOCKED("unblocked"),
    IN_PROGRESS("in_progress"),
    COMPLETED("completed");

    private final String value;

    ProgressStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}