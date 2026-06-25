package com.wordly.backend.dto;

import java.util.List;

public record VocabularyResponse(
        int total,
        int page,
        List<VocabularyWordResponse> words
) {}
