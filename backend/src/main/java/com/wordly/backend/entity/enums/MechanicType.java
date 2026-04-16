package com.wordly.backend.entity.enums;

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

    public String getValue() {
        return value;
    }
}
