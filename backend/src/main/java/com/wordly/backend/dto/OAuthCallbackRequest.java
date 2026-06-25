package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record OAuthCallbackRequest(
        @NotBlank String code,
        @NotBlank @JsonProperty("redirect_uri") String redirectUri
) {}