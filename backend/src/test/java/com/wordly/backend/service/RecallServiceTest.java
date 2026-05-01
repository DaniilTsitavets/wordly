package com.wordly.backend.service;

import com.wordly.backend.dto.AnswerResultResponse;
import com.wordly.backend.dto.RecallAnswerRequest;
import com.wordly.backend.dto.RecallCompleteResponse;
import com.wordly.backend.dto.RecallWordsResponse;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.UserWordState;
import com.wordly.backend.entity.Word;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.UserRepository;
import com.wordly.backend.repository.UserWordStateRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecallService")
class RecallServiceTest {

    @Mock
    private UserWordStateRepository userWordStateRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecallService recallService;

    private Word word(long id, String wordEn) {
        return Word.builder()
                .id(id)
                .wordEn(wordEn)
                .translationRu("перевод")
                .transcriptionEn("trænskrɪpʃən")
                .build();
    }

    private UserWordState state(long userId, Word word, int interval, LocalDate nextRecall) {
        return UserWordState.builder()
                .userId(userId)
                .word(word)
                .status(WordStatus.RECALLING)
                .recallInterval(interval)
                .nextRecall(nextRecall)
                .build();
    }

    @Nested
    @DisplayName("getRecallWords")
    class GetRecallWords {

        @Test
        @DisplayName("should return words due for recall today")
        void shouldReturnDueWords() {
            Word w1 = word(1L, "plate");
            Word w2 = word(2L, "fork");
            List<UserWordState> due = List.of(
                    state(10L, w1, 3, LocalDate.now()),
                    state(10L, w2, 7, LocalDate.now().minusDays(1))
            );
            when(userWordStateRepository.findByUserIdAndNextRecallLessThanEqual(10L, LocalDate.now()))
                    .thenReturn(due);

            RecallWordsResponse response = recallService.getRecallWords(10L);

            assertThat(response.total()).isEqualTo(2);
            assertThat(response.words()).hasSize(2);
            assertThat(response.words().get(0).wordEn()).isEqualTo("plate");
            assertThat(response.words().get(0).recallInterval()).isEqualTo(3);
        }

        @Test
        @DisplayName("should return empty list when no words are due")
        void shouldReturnEmptyWhenNoneDue() {
            when(userWordStateRepository.findByUserIdAndNextRecallLessThanEqual(10L, LocalDate.now()))
                    .thenReturn(List.of());

            RecallWordsResponse response = recallService.getRecallWords(10L);

            assertThat(response.total()).isZero();
            assertThat(response.words()).isEmpty();
        }
    }

    @Nested
    @DisplayName("submitAnswer")
    class SubmitAnswer {

        @Test
        @DisplayName("should advance interval on correct answer")
        void shouldAdvanceIntervalOnCorrect() {
            Word w = word(1L, "plate");
            UserWordState s = state(10L, w, 1, LocalDate.now());
            when(userWordStateRepository.findByUserIdAndWordId(10L, 1L)).thenReturn(Optional.of(s));

            RecallAnswerRequest request = new RecallAnswerRequest(1L, "plate");
            AnswerResultResponse result = recallService.submitAnswer(request, 10L);

            assertThat(result.isCorrect()).isTrue();
            assertThat(result.correctAnswer()).isEqualTo("plate");
            assertThat(s.getRecallInterval()).isEqualTo(3);
            assertThat(s.getNextRecall()).isEqualTo(LocalDate.now().plusDays(3));
            verify(userWordStateRepository).save(s);
        }

        @Test
        @DisplayName("should advance through all intervals correctly: 1→3→7→14→21→30")
        void shouldAdvanceThroughAllIntervals() {
            int[] expectedSequence = {3, 7, 14, 21, 30};
            Word w = word(1L, "fork");
            UserWordState s = state(10L, w, 1, LocalDate.now());
            when(userWordStateRepository.findByUserIdAndWordId(10L, 1L)).thenReturn(Optional.of(s));

            for (int expected : expectedSequence) {
                recallService.submitAnswer(new RecallAnswerRequest(1L, "fork"), 10L);
                assertThat(s.getRecallInterval()).isEqualTo(expected);
            }
        }

        @Test
        @DisplayName("should mark word as LONG_TERM_MEMORY when correctly answered at max interval")
        void shouldMarkLongTermMemoryAtMaxInterval() {
            Word w = word(1L, "plate");
            UserWordState s = state(10L, w, 30, LocalDate.now());
            when(userWordStateRepository.findByUserIdAndWordId(10L, 1L)).thenReturn(Optional.of(s));

            recallService.submitAnswer(new RecallAnswerRequest(1L, "plate"), 10L);

            assertThat(s.getStatus()).isEqualTo(WordStatus.LONG_TERM_MEMORY);
            assertThat(s.getNextRecall()).isNull();
        }

        @Test
        @DisplayName("should reset interval to 1 on incorrect answer")
        void shouldResetIntervalOnIncorrect() {
            Word w = word(1L, "plate");
            UserWordState s = state(10L, w, 14, LocalDate.now());
            when(userWordStateRepository.findByUserIdAndWordId(10L, 1L)).thenReturn(Optional.of(s));

            AnswerResultResponse result = recallService.submitAnswer(new RecallAnswerRequest(1L, "wrong"), 10L);

            assertThat(result.isCorrect()).isFalse();
            assertThat(result.correctAnswer()).isEqualTo("plate");
            assertThat(s.getRecallInterval()).isEqualTo(1);
            assertThat(s.getNextRecall()).isEqualTo(LocalDate.now().plusDays(1));
            assertThat(s.getStatus()).isEqualTo(WordStatus.RECALLING);
        }

        @Test
        @DisplayName("should restore RECALLING status when LONG_TERM_MEMORY word answered incorrectly")
        void shouldRestoreRecallingStatusOnIncorrect() {
            Word w = word(1L, "plate");
            UserWordState s = UserWordState.builder()
                    .userId(10L).word(w).status(WordStatus.LONG_TERM_MEMORY)
                    .recallInterval(30).nextRecall(null).build();
            when(userWordStateRepository.findByUserIdAndWordId(10L, 1L)).thenReturn(Optional.of(s));

            recallService.submitAnswer(new RecallAnswerRequest(1L, "wrong"), 10L);

            assertThat(s.getStatus()).isEqualTo(WordStatus.RECALLING);
            assertThat(s.getRecallInterval()).isEqualTo(1);
        }

        @Test
        @DisplayName("should be case-insensitive and trim whitespace")
        void shouldBeCaseInsensitiveAndTrimmed() {
            Word w = word(1L, "Plate");
            UserWordState s = state(10L, w, 1, LocalDate.now());
            when(userWordStateRepository.findByUserIdAndWordId(10L, 1L)).thenReturn(Optional.of(s));

            AnswerResultResponse result = recallService.submitAnswer(new RecallAnswerRequest(1L, "  PLATE  "), 10L);

            assertThat(result.isCorrect()).isTrue();
        }

        @Test
        @DisplayName("should throw NotFoundException when word state does not exist")
        void shouldThrowWhenWordStateNotFound() {
            when(userWordStateRepository.findByUserIdAndWordId(10L, 99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> recallService.submitAnswer(new RecallAnswerRequest(99L, "plate"), 10L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("completeRecall")
    class CompleteRecall {

        @Test
        @DisplayName("should return session stats and award gems")
        void shouldReturnStatsAndAwardGems() {
            Word w1 = word(1L, "plate");
            Word w2 = word(2L, "fork");
            Word w3 = word(3L, "knife");
            UserWordState s1 = state(10L, w1, 1, LocalDate.now());
            UserWordState s2 = state(10L, w2, 1, LocalDate.now());
            UserWordState s3 = state(10L, w3, 1, LocalDate.now());
            when(userWordStateRepository.findByUserIdAndWordId(10L, 1L)).thenReturn(Optional.of(s1));
            when(userWordStateRepository.findByUserIdAndWordId(10L, 2L)).thenReturn(Optional.of(s2));
            when(userWordStateRepository.findByUserIdAndWordId(10L, 3L)).thenReturn(Optional.of(s3));
            when(userWordStateRepository.findByUserIdAndSessionDate(10L, LocalDate.now()))
                    .thenReturn(List.of(s1, s2, s3));

            User user = User.builder().id(10L).gems(50).build();
            when(userRepository.findById(10L)).thenReturn(Optional.of(user));

            recallService.submitAnswer(new RecallAnswerRequest(1L, "plate"), 10L);
            recallService.submitAnswer(new RecallAnswerRequest(2L, "fork"), 10L);
            recallService.submitAnswer(new RecallAnswerRequest(3L, "wrong"), 10L);

            RecallCompleteResponse response = recallService.completeRecall(10L);

            assertThat(response.correct()).isEqualTo(2);
            assertThat(response.failed()).isEqualTo(1);
            assertThat(response.totalWords()).isEqualTo(3);
            assertThat(response.gemsEarned()).isEqualTo(10);
            assertThat(user.getGems()).isEqualTo(60);
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("should return zero stats and no gems when complete is called without any answers")
        void shouldReturnZeroStatsWithNoAnswers() {
            when(userWordStateRepository.findByUserIdAndSessionDate(10L, LocalDate.now()))
                    .thenReturn(List.of());

            RecallCompleteResponse response = recallService.completeRecall(10L);

            assertThat(response.correct()).isZero();
            assertThat(response.failed()).isZero();
            assertThat(response.totalWords()).isZero();
            assertThat(response.gemsEarned()).isZero();
        }

        @Test
        @DisplayName("should clear session stats after complete so second call returns zeros and does not award gems again")
        void shouldClearSessionAfterComplete() {
            Word w = word(1L, "plate");
            UserWordState s = state(10L, w, 1, LocalDate.now());
            when(userWordStateRepository.findByUserIdAndWordId(10L, 1L)).thenReturn(Optional.of(s));
            when(userWordStateRepository.findByUserIdAndSessionDate(10L, LocalDate.now()))
                    .thenReturn(List.of(s))
                    .thenReturn(List.of());

            User user = User.builder().id(10L).gems(0).build();
            when(userRepository.findById(10L)).thenReturn(Optional.of(user));

            recallService.submitAnswer(new RecallAnswerRequest(1L, "plate"), 10L);
            recallService.completeRecall(10L);

            RecallCompleteResponse secondCall = recallService.completeRecall(10L);

            assertThat(secondCall.correct()).isZero();
            assertThat(secondCall.failed()).isZero();
            assertThat(secondCall.gemsEarned()).isZero();
            assertThat(user.getGems()).isEqualTo(10);
        }

        @Test
        @DisplayName("should throw NotFoundException when user does not exist")
        void shouldThrowWhenUserNotFound() {
            Word w = word(1L, "plate");
            UserWordState s = state(99L, w, 1, LocalDate.now());
            when(userWordStateRepository.findByUserIdAndWordId(99L, 1L)).thenReturn(Optional.of(s));
            when(userWordStateRepository.findByUserIdAndSessionDate(99L, LocalDate.now()))
                    .thenReturn(List.of(s));
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            recallService.submitAnswer(new RecallAnswerRequest(1L, "plate"), 99L);

            assertThatThrownBy(() -> recallService.completeRecall(99L))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}