package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MnemonicResponse(
        @JsonProperty("image_url")
        String imageUrl,

        @JsonProperty("mnemo_text")
        String mnemoText
) {}
