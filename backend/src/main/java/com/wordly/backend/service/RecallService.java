package com.wordly.backend.service;

import com.wordly.backend.dto.AnswerResultResponse;
import com.wordly.backend.dto.RecallAnswerRequest;
import com.wordly.backend.dto.RecallCompleteResponse;
import com.wordly.backend.dto.RecallWordResponse;
import com.wordly.backend.dto.RecallWordsResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.UserWordState;
import com.wordly.backend.entity.Word;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.UserRepository;
import com.wordly.backend.repository.UserWordStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RecallService {

    private static final int[] RECALL_INTERVALS = {1, 3, 7, 14, 21, 30};
    private static final int GEMS_PER_RECALL_SESSION = 10;

    private final UserWordStateRepository userWordStateRepository;
    private final UserRepository userRepository;

    // Tracks [correct, failed] counts per user session in memory
    private final ConcurrentHashMap<Long, int[]> sessionStats = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public RecallWordsResponse getRecallWords(Long userId) {
        List<UserWordState> due = userWordStateRepository
                .findByUserIdAndNextRecallLessThanEqual(userId, LocalDate.now());
        List<RecallWordResponse> words = due.stream()
                .map(this::toRecallWord)
                .toList();
        return new RecallWordsResponse(words.size(), words);
    }

    @Transactional
    public AnswerResultResponse submitAnswer(RecallAnswerRequest request, Long userId) {
        Long wordId = request.wordId();
        UserWordState state = userWordStateRepository.findByUserIdAndWordId(userId, wordId)
                .orElseThrow(() -> new NotFoundException("Word state not found for word: " + wordId));

        Word word = state.getWord();
        boolean isCorrect = request.userAnswer().trim().equalsIgnoreCase(word.getWordEn());

        if (isCorrect) {
            advanceInterval(state);
        } else {
            resetInterval(state);
        }
        userWordStateRepository.save(state);

        sessionStats.compute(userId, (id, arr) -> {
            if (arr == null) arr = new int[2];
            if (isCorrect) arr[0]++; else arr[1]++;
            return arr;
        });

        return new AnswerResultResponse(wordId, isCorrect, word.getWordEn());
    }

    @Transactional
    public RecallCompleteResponse completeRecall(Long userId) {
        int[] stats = sessionStats.remove(userId);
        int correct = stats != null ? stats[0] : 0;
        int failed = stats != null ? stats[1] : 0;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        user.setGems(user.getGems() + GEMS_PER_RECALL_SESSION);
        userRepository.save(user);

        return new RecallCompleteResponse(correct + failed, correct, failed, GEMS_PER_RECALL_SESSION);
    }

    private void advanceInterval(UserWordState state) {
        int current = state.getRecallInterval();
        if (current >= RECALL_INTERVALS[RECALL_INTERVALS.length - 1]) {
            state.setStatus(WordStatus.LONG_TERM_MEMORY);
            state.setNextRecall(null);
            return;
        }
        int next = nextInterval(current);
        state.setRecallInterval(next);
        state.setNextRecall(LocalDate.now().plusDays(next));
    }

    private void resetInterval(UserWordState state) {
        state.setStatus(WordStatus.RECALLING);
        state.setRecallInterval(1);
        state.setNextRecall(LocalDate.now().plusDays(1));
    }

    private int nextInterval(int current) {
        for (int i = 0; i < RECALL_INTERVALS.length - 1; i++) {
            if (RECALL_INTERVALS[i] == current) {
                return RECALL_INTERVALS[i + 1];
            }
        }
        return RECALL_INTERVALS[RECALL_INTERVALS.length - 1];
    }

    private RecallWordResponse toRecallWord(UserWordState state) {
        Word word = state.getWord();
        return new RecallWordResponse(
                word.getId(),
                word.getWordEn(),
                word.getTranslationRu(),
                word.getTranscriptionEn(),
                state.getRecallInterval()
        );
    }
}