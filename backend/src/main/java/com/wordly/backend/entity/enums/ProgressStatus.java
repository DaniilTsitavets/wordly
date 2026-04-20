package com.wordly.backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProgressStatus {
    LOCKED("locked"),
    UNBLOCKED("unblocked"),
    IN_PROGRESS("in_progress"),
    COMPLETED("completed");

    private final String value;

    ProgressStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ProgressStatus fromValue(String value) {
        for (ProgressStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown progress status: " + value);
    }
}