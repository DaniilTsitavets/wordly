package com.wordly.backend;

import com.wordly.backend.entity.User;
import com.wordly.backend.entity.UserWordState;
import com.wordly.backend.entity.Word;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.repository.UserRepository;
import com.wordly.backend.repository.UserWordStateRepository;
import com.wordly.backend.repository.WordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end check (real Postgres) of the {@code best_recall_time} aggregate: {@code MIN} over a
 * user's word states skips NULL per-word times, is scoped to the user, and yields an empty
 * {@link Optional} (not 0) when there is no record yet.
 *
 * <p>Naming ends in {@code IT} so Surefire does not pick it up in a DB-less {@code mvn test}; run
 * explicitly with a live DB: {@code mvn test -Dtest=RecallTimeIT}.
 */
@SpringBootTest
@DisplayName("Recall time IT: MIN(recall_time_ms) aggregate")
class RecallTimeIT {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserWordStateRepository userWordStateRepository;
    @Autowired
    private WordRepository wordRepository;

    private User newUser() {
        return userRepository.save(User.builder()
                .name("IT").surname("User")
                .email("recall-time-it-" + UUID.randomUUID() + "@wordly.local")
                .guest(false)
                .build());
    }

    private void addState(Long userId, Word word, Integer recallTimeMs) {
        userWordStateRepository.save(UserWordState.builder()
                .userId(userId)
                .word(word)
                .status(WordStatus.RECALLING)
                .recallInterval(1)
                .recallTimeMs(recallTimeMs)
                .build());
    }

    @Test
    void bestRecallTime_isEmptyWithoutData_thenMinOverNonNull_scopedToUser() {
        List<Word> words = wordRepository.findAll();
        assertThat(words).as("V2 seed words present").hasSizeGreaterThanOrEqualTo(3);

        Long userId = newUser().getId();

        // no states yet → empty, not 0
        assertThat(userWordStateRepository.findBestRecallTimeMs(userId)).isEmpty();

        addState(userId, words.get(0), null); // never recalled
        addState(userId, words.get(1), 5000);
        addState(userId, words.get(2), 3400);

        assertThat(userWordStateRepository.findBestRecallTimeMs(userId)).contains(3400);

        // another user's faster time must not leak in
        Long otherUserId = newUser().getId();
        addState(otherUserId, words.get(0), 100);

        assertThat(userWordStateRepository.findBestRecallTimeMs(userId)).contains(3400);
        assertThat(userWordStateRepository.findBestRecallTimeMs(otherUserId)).contains(100);
    }
}
