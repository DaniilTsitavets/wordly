package com.wordly.backend.service;

import com.wordly.backend.dto.VocabularyResponse;
import com.wordly.backend.dto.VocabularyWordResponse;
import com.wordly.backend.entity.UserWordState;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.repository.UserWordStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VocabularyService {

    private final UserWordStateRepository userWordStateRepository;

    @Transactional(readOnly = true)
    public VocabularyResponse getVocabulary(Long userId, WordStatus status, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);

        Page<UserWordState> wordStatePage = status != null
                ? userWordStateRepository.findByUserIdAndStatus(userId, status, pageable)
                : userWordStateRepository.findByUserId(userId, pageable);

        return new VocabularyResponse(
                (int) wordStatePage.getTotalElements(),
                page,
                wordStatePage.getContent().stream()
                        .map(this::toVocabularyWordResponse)
                        .toList()
        );
    }

    private VocabularyWordResponse toVocabularyWordResponse(UserWordState state) {
        var word = state.getWord();
        return new VocabularyWordResponse(
                word.getId(),
                word.getWordEn(),
                word.getTranscriptionEn(),
                word.getTranslationRu(),
                word.getImageUrl(),
                state.getStatus(),
                state.getNextRecall()
        );
    }
}
