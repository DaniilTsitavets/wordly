package com.wordly.backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ColorTheme {
    LIGHT("light"),
    DARK("dark"),
    SYSTEM("system");

    private final String value;

    ColorTheme(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ColorTheme fromValue(String value) {
        for (ColorTheme theme : values()) {
            if (theme.value.equalsIgnoreCase(value)) {
                return theme;
            }
        }
        throw new IllegalArgumentException("Unknown color theme: " + value);
    }
}