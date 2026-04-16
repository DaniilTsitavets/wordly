package com.wordly.backend.dto;

import java.util.List;

public record SubtopicWordsResponse(
        List<WordPreviewResponse> words
) {}