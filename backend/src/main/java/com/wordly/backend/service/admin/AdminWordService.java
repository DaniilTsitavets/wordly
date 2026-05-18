package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminBulkWordItem;
import com.wordly.backend.dto.admin.AdminBulkWordsRequest;
import com.wordly.backend.dto.admin.AdminBulkWordsResponse;
import com.wordly.backend.dto.admin.AdminWordRequest;
import com.wordly.backend.dto.admin.AdminWordResponse;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Word;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminWordService {

    private final WordRepository wordRepository;
    private final SubtopicRepository subtopicRepository;

    @Transactional(readOnly = true)
    public List<AdminWordResponse> listBySubtopic(Long subtopicId) {
        if (!subtopicRepository.existsById(subtopicId)) {
            throw new NotFoundException("Subtopic not found: " + subtopicId);
        }
        return wordRepository.findBySubtopicIdOrderByIdAsc(subtopicId).stream()
                .map(AdminWordResponse::of)
                .toList();
    }

    @Transactional
    public AdminWordResponse create(AdminWordRequest request) {
        Subtopic subtopic = subtopicRepository.findById(request.subtopicId())
                .orElseThrow(() -> new NotFoundException("Subtopic not found: " + request.subtopicId()));

        Word word = applyRequestToNewWord(subtopic, request);
        Word saved = wordRepository.save(word);

        log.info("Admin created word id={} (subtopic={})", saved.getId(), subtopic.getId());
        return AdminWordResponse.of(saved);
    }

    @Transactional
    public AdminWordResponse update(Long wordId, AdminWordRequest request) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new NotFoundException("Word not found: " + wordId));

        Subtopic targetSubtopic = word.getSubtopic();
        if (!targetSubtopic.getId().equals(request.subtopicId())) {
            targetSubtopic = subtopicRepository.findById(request.subtopicId())
                    .orElseThrow(() -> new NotFoundException("Subtopic not found: " + request.subtopicId()));
        }

        word.setSubtopic(targetSubtopic);
        word.setWordEn(request.wordEn().trim());
        word.setTranscriptionEn(blankToNull(request.transcriptionEn()));
        word.setTranslationRu(request.translationRu().trim());
        word.setImageUrl(blankToNull(request.imageUrl()));
        word.setUsageExampleEn(blankToNull(request.usageExampleEn()));
        word.setUsageExampleEnTranslationRu(blankToNull(request.usageExampleEnTranslationRu()));
        word.setMnemonicImageUrl(blankToNull(request.mnemonicImageUrl()));
        word.setMnemoText(blankToNull(request.mnemoText()));

        Word saved = wordRepository.save(word);

        log.info("Admin updated word id={}", saved.getId());
        return AdminWordResponse.of(saved);
    }

    @Transactional
    public void delete(Long wordId) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new NotFoundException("Word not found: " + wordId));
        wordRepository.delete(word);
        log.info("Admin deleted word id={}", wordId);
    }

    @Transactional
    public AdminBulkWordsResponse bulkCreate(AdminBulkWordsRequest request) {
        Subtopic subtopic = subtopicRepository.findById(request.subtopicId())
                .orElseThrow(() -> new NotFoundException("Subtopic not found: " + request.subtopicId()));

        List<Word> toSave = new ArrayList<>(request.words().size());
        for (AdminBulkWordItem item : request.words()) {
            toSave.add(Word.builder()
                    .subtopic(subtopic)
                    .wordEn(item.wordEn().trim())
                    .transcriptionEn(blankToNull(item.transcriptionEn()))
                    .translationRu(item.translationRu().trim())
                    .imageUrl(safe(item.imageUrl()))
                    .usageExampleEn(blankToNull(item.usageExampleEn()))
                    .usageExampleEnTranslationRu(blankToNull(item.usageExampleEnTranslationRu()))
                    .mnemonicImageUrl(blankToNull(item.mnemonicImageUrl()))
                    .mnemoText(blankToNull(item.mnemoText()))
                    .build());
        }

        List<Word> saved = wordRepository.saveAll(toSave);

        log.info("Admin bulk-created {} words (subtopic={})", saved.size(), subtopic.getId());
        return new AdminBulkWordsResponse(
                subtopic.getId(),
                saved.size(),
                saved.stream().map(AdminWordResponse::of).toList()
        );
    }

    private Word applyRequestToNewWord(Subtopic subtopic, AdminWordRequest request) {
        return Word.builder()
                .subtopic(subtopic)
                .wordEn(request.wordEn().trim())
                .transcriptionEn(blankToNull(request.transcriptionEn()))
                .translationRu(request.translationRu().trim())
                .imageUrl(blankToNull(request.imageUrl()))
                .usageExampleEn(blankToNull(request.usageExampleEn()))
                .usageExampleEnTranslationRu(blankToNull(request.usageExampleEnTranslationRu()))
                .mnemonicImageUrl(blankToNull(request.mnemonicImageUrl()))
                .mnemoText(blankToNull(request.mnemoText()))
                .build();
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}