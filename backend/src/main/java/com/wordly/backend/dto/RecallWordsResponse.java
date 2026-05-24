package com.wordly.backend.dto;

import java.util.List;

public record RecallWordsResponse(
        int total,
        List<RecallWordResponse> words
) {}