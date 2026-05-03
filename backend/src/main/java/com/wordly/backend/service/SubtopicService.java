package com.wordly.backend.service;

import com.wordly.backend.dto.*;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.entity.Word;
import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.TopicRepository;
import com.wordly.backend.repository.UserSubtopicLevelMechanicProgressRepository;
import com.wordly.backend.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubtopicService {

    private final SubtopicRepository subtopicRepository;
    private final TopicRepository topicRepository;
    private final WordRepository wordRepository;
    private final UserSubtopicLevelMechanicProgressRepository progressRepository;
    private final ProgressComputationService progressComputationService;

    @Transactional(readOnly = true)
    public SubtopicDetailResponse getSubtopicDetail(Long subtopicId, Long userId, boolean isGuest) {
        Subtopic subtopic = getAccessibleSubtopic(subtopicId, isGuest);

        List<UserSubtopicLevelMechanicProgress> progress =
                progressRepository.findByUserIdAndSubtopicId(userId, subtopicId);

        List<LevelProgressResponse> levels =
                progressComputationService.buildLevelProgress(subtopic, progress);

        return new SubtopicDetailResponse(
                subtopic.getId(),
                subtopic.getName(),
                subtopic.getDescription(),
                subtopic.getImageUrl(),
                subtopic.getWordsCount(),
                subtopic.getDisabledMechanics(),
                levels
        );
    }

    @Transactional(readOnly = true)
    public List<SubtopicSummaryResponse> getSubtopicsByIds(List<Long> ids, Long userId) {
        List<Subtopic> subtopics = subtopicRepository.findAllById(ids);
        List<UserSubtopicLevelMechanicProgress> progress = progressRepository.findByUserId(userId);
        return progressComputationService.buildSubtopicSummaries(subtopics, progress, userId);
    }

    @Transactional(readOnly = true)
    public SubtopicWordsResponse getSubtopicWords(Long subtopicId, Long userId, boolean isGuest) {
        Subtopic subtopic = getAccessibleSubtopic(subtopicId, isGuest);

        List<Word> words = wordRepository.findBySubtopicIdOrderByIdAsc(subtopic.getId());

        List<WordPreviewResponse> wordResponses = words.stream()
                .map(word -> new WordPreviewResponse(
                        word.getId(),
                        word.getWordEn(),
                        word.getTranscriptionEn(),
                        word.getTranslationRu(),
                        word.getImageUrl(),
                        word.hasMnemonic(),
                        word.hasMnemonic() ? word.getMnemoText() : null
                ))
                .toList();

        return new SubtopicWordsResponse(wordResponses);
    }

    Subtopic getAccessibleSubtopic(Long subtopicId, boolean isGuest) {
        Subtopic subtopic = subtopicRepository.findById(subtopicId)
                .orElseThrow(() -> new NotFoundException("Subtopic not found: " + subtopicId));

        if (!isGuest) {
            return subtopic;
        }

        Topic firstTopic = topicRepository.findFirstByOrderBySortOrderAscIdAsc()
                .orElseThrow(() -> new NotFoundException("No topics found"));

        if (!subtopic.getTopic().getId().equals(firstTopic.getId())) {
            throw new NotFoundException("Subtopic not found: " + subtopicId);
        }

        return subtopic;
    }
}