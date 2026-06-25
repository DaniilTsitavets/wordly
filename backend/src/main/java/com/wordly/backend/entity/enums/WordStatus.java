package com.wordly.backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum WordStatus {
    NEW("new"),
    LEARNING("learning"),
    RECALLING("recalling"),
    LONG_TERM_MEMORY("long_term_memory");

    private final String value;

    WordStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static WordStatus fromValue(String value) {
        for (WordStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown word status: " + value);
    }
}
