package com.wordly.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordly.backend.entity.enums.MechanicType;
import jakarta.validation.constraints.NotNull;

public record CompleteSessionRequest(
        @NotNull
        @JsonProperty("mechanic_type")
        MechanicType mechanicType
) {}
