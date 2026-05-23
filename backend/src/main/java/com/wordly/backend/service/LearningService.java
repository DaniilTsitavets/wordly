package com.wordly.backend.service;

import com.wordly.backend.dto.*;
import com.wordly.backend.entity.*;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.exception.LevelLockedException;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningService {

    private static final int GEMS_PER_LEVEL = 5;

    private final SubtopicService subtopicService;
    private final WordRepository wordRepository;
    private final UserRepository userRepository;
    private final UserSubtopicLevelMechanicProgressRepository progressRepository;
    private final UserWordStateRepository userWordStateRepository;
    private final ProgressComputationService progressComputationService;

    @Transactional
    public SessionDataResponse getSession(Long subtopicId, Long userId, boolean isGuest) {
        Subtopic subtopic = subtopicService.getAccessibleSubtopic(subtopicId, isGuest);
        List<MechanicType> activeMechanics = progressComputationService.getActiveMechanics(subtopic);

        List<UserSubtopicLevelMechanicProgress> userProgress =
                progressRepository.findByUserIdAndSubtopicId(userId, subtopicId);

        Map<MechanicType, UserSubtopicLevelMechanicProgress> progressMap = userProgress.stream()
                .collect(Collectors.toMap(
                        UserSubtopicLevelMechanicProgress::getMechanicType,
                        Function.identity(),
                        (a, b) -> a
                ));

        MechanicType currentMechanic = resolveCurrentMechanic(activeMechanics, progressMap);

        if (!progressMap.containsKey(currentMechanic)) {
            progressRepository.save(UserSubtopicLevelMechanicProgress.builder()
                    .userId(userId)
                    .subtopic(subtopic)
                    .mechanicType(currentMechanic)
                    .status(ProgressStatus.IN_PROGRESS)
                    .build());
        }

        List<Word> words = wordRepository.findBySubtopicIdOrderByIdAsc(subtopicId);
        List<SessionWordResponse> sessionWords = words.stream()
                .map(word -> toSessionWord(word, currentMechanic))
                .toList();

        return new SessionDataResponse(subtopicId, currentMechanic, sessionWords);
    }

    @Transactional
    public AnswerResultResponse submitAnswer(Long subtopicId, AnswerRequest request, Long userId) {
        Long wordId = request.wordId();
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new NotFoundException("Word not found: " + wordId));

        boolean isCorrect = request.userAnswer().trim().equalsIgnoreCase(word.getWordEn());

        if (userWordStateRepository.findByUserIdAndWordId(userId, wordId).isEmpty()) {
            userWordStateRepository.save(UserWordState.builder()
                    .userId(userId)
                    .word(word)
                    .status(WordStatus.LEARNING)
                    .build());
        }

        return new AnswerResultResponse(wordId, isCorrect, word.getWordEn());
    }

    @Transactional
    public LevelCompleteResultResponse completeLevel(Long subtopicId, CompleteSessionRequest request, Long userId, boolean isGuest) {
        Subtopic subtopic = subtopicService.getAccessibleSubtopic(subtopicId, isGuest);
        MechanicType mechanicType = request.mechanicType();
        List<MechanicType> activeMechanics = progressComputationService.getActiveMechanics(subtopic);

        UserSubtopicLevelMechanicProgress progress = progressRepository
                .findByUserIdAndSubtopicIdAndMechanicType(userId, subtopicId, mechanicType)
                .orElseGet(() -> {
                    int idx = activeMechanics.indexOf(mechanicType);
                    if (idx < 0) {
                        throw new LevelLockedException("Level not unlocked: " + mechanicType);
                    }
                    if (idx > 0) {
                        MechanicType prev = activeMechanics.get(idx - 1);
                        boolean prevCompleted = progressRepository
                                .findByUserIdAndSubtopicIdAndMechanicType(userId, subtopicId, prev)
                                .map(p -> p.getStatus() == ProgressStatus.COMPLETED)
                                .orElse(false);
                        if (!prevCompleted) {
                            throw new LevelLockedException("Level not unlocked: " + mechanicType);
                        }
                    }
                    return progressRepository.save(UserSubtopicLevelMechanicProgress.builder()
                            .userId(userId)
                            .subtopic(subtopic)
                            .mechanicType(mechanicType)
                            .status(ProgressStatus.IN_PROGRESS)
                            .build());
                });

        if (progress.getStatus() == ProgressStatus.COMPLETED) {
            MechanicType alreadyNext = findNextMechanic(activeMechanics, mechanicType);
            return new LevelCompleteResultResponse(mechanicType, 0, alreadyNext, alreadyNext == null);
        }

        progress.setStatus(ProgressStatus.COMPLETED);
        progress.setCompletedAt(LocalDateTime.now());
        progressRepository.save(progress);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        user.setGems(user.getGems() + GEMS_PER_LEVEL);
        userRepository.save(user);

        applyWordStateTransition(subtopicId, userId, mechanicType);

        MechanicType nextMechanic = findNextMechanic(activeMechanics, mechanicType);

        if (nextMechanic != null) {
            boolean nextExists = progressRepository
                    .findByUserIdAndSubtopicIdAndMechanicType(userId, subtopicId, nextMechanic)
                    .isPresent();
            if (!nextExists) {
                progressRepository.save(UserSubtopicLevelMechanicProgress.builder()
                        .userId(userId)
                        .subtopic(subtopic)
                        .mechanicType(nextMechanic)
                        .status(ProgressStatus.UNBLOCKED)
                        .build());
            }
        }

        return new LevelCompleteResultResponse(mechanicType, GEMS_PER_LEVEL, nextMechanic, nextMechanic == null);
    }

    private MechanicType resolveCurrentMechanic(
            List<MechanicType> activeMechanics,
            Map<MechanicType, UserSubtopicLevelMechanicProgress> progressMap
    ) {
        for (UserSubtopicLevelMechanicProgress p : progressMap.values()) {
            if (p.getStatus() == ProgressStatus.IN_PROGRESS) {
                return p.getMechanicType();
            }
        }

        for (int i = 0; i < activeMechanics.size(); i++) {
            MechanicType mechanic = activeMechanics.get(i);
            UserSubtopicLevelMechanicProgress p = progressMap.get(mechanic);

            if (p == null) {
                boolean predecessorDone = i == 0 || progressMap.get(activeMechanics.get(i - 1)) != null
                        && progressMap.get(activeMechanics.get(i - 1)).getStatus() == ProgressStatus.COMPLETED;
                if (predecessorDone) {
                    return mechanic;
                }
                break;
            }

            if (p.getStatus() == ProgressStatus.UNBLOCKED) {
                return mechanic;
            }
        }

        throw new LevelLockedException("No unlocked level available for subtopic");
    }

    private SessionWordResponse toSessionWord(Word word, MechanicType mechanicType) {
        MnemonicResponse mnemonic = null;
        if (mechanicType == MechanicType.MNEMONIC_CARDS && word.hasMnemonic()) {
            mnemonic = new MnemonicResponse(word.getMnemonicImageUrl(), word.getMnemoText());
        }
        return new SessionWordResponse(
                word.getId(),
                word.getWordEn(),
                word.getTranscriptionEn(),
                word.getTranslationRu(),
                word.getImageUrl(),
                word.getUsageExampleEn(),
                word.getUsageExampleEnTranslationRu(),
                mnemonic
        );
    }

    private MechanicType findNextMechanic(List<MechanicType> activeMechanics, MechanicType current) {
        for (int i = 0; i < activeMechanics.size() - 1; i++) {
            if (activeMechanics.get(i) == current) {
                return activeMechanics.get(i + 1);
            }
        }
        return null;
    }

    private void applyWordStateTransition(Long subtopicId, Long userId, MechanicType mechanicType) {
        if (mechanicType != MechanicType.FLASHCARDS && mechanicType != MechanicType.WORD_BUILDER) {
            return;
        }

        List<Word> words = wordRepository.findBySubtopicIdOrderByIdAsc(subtopicId);

        for (Word word : words) {
            UserWordState state = userWordStateRepository
                    .findByUserIdAndWordId(userId, word.getId())
                    .orElseGet(() -> UserWordState.builder()
                            .userId(userId)
                            .word(word)
                            .build());

            if (mechanicType == MechanicType.FLASHCARDS && state.getStatus() == WordStatus.NEW) {
                state.setStatus(WordStatus.LEARNING);
            } else if (mechanicType == MechanicType.WORD_BUILDER) {
                state.setStatus(WordStatus.RECALLING);
                state.setRecallInterval(1);
                state.setNextRecall(LocalDate.now().plusDays(1));
            }

            userWordStateRepository.save(state);
        }
    }
}
