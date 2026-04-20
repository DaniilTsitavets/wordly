package com.wordly.backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MechanicType {
    MNEMONIC_CARDS("mnemonic_cards"),
    FLASHCARDS("flashcards"),
    MATCHING("matching"),
    FILLING_GAPS("filling_gaps"),
    WORD_BUILDER("word_builder");

    private final String value;

    MechanicType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static MechanicType fromValue(String value) {
        for (MechanicType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown mechanic type: " + value);
    }
}
