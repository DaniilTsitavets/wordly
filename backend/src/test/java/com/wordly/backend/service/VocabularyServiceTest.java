package com.wordly.backend.service;

import com.wordly.backend.dto.VocabularyResponse;
import com.wordly.backend.entity.UserWordState;
import com.wordly.backend.entity.Word;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.repository.UserWordStateRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("VocabularyService")
class VocabularyServiceTest {

    @Mock
    private UserWordStateRepository userWordStateRepository;

    @InjectMocks
    private VocabularyService vocabularyService;

    private Word word(long id, String wordEn) {
        return Word.builder()
                .id(id)
                .wordEn(wordEn)
                .translationRu("перевод")
                .transcriptionEn("trænskrɪpʃən")
                .imageUrl("")
                .build();
    }

    private UserWordState state(long userId, Word word, WordStatus status) {
        return UserWordState.builder()
                .userId(userId)
                .word(word)
                .status(status)
                .build();
    }

    @Nested
    @DisplayName("getVocabulary")
    class GetVocabulary {

        @Test
        @DisplayName("should return all words when no status filter is given")
        void shouldReturnAllWordsWithoutFilter() {
            Word w1 = word(1L, "plate");
            Word w2 = word(2L, "fork");
            Page<UserWordState> page = new PageImpl<>(List.of(
                    state(1L, w1, WordStatus.LEARNING),
                    state(1L, w2, WordStatus.RECALLING)
            ));
            when(userWordStateRepository.findByUserId(eq(1L), any(Pageable.class))).thenReturn(page);

            VocabularyResponse response = vocabularyService.getVocabulary(1L, null, 1, 20);

            assertThat(response.total()).isEqualTo(2);
            assertThat(response.page()).isEqualTo(1);
            assertThat(response.words()).hasSize(2);
            assertThat(response.words().get(0).wordEn()).isEqualTo("plate");
            assertThat(response.words().get(1).wordEn()).isEqualTo("fork");
        }

        @Test
        @DisplayName("should filter by status when a status is provided")
        void shouldFilterByStatus() {
            Word w = word(1L, "plate");
            Page<UserWordState> page = new PageImpl<>(List.of(state(1L, w, WordStatus.LEARNING)));
            when(userWordStateRepository.findByUserIdAndStatus(eq(1L), eq(WordStatus.LEARNING), any(Pageable.class)))
                    .thenReturn(page);

            VocabularyResponse response = vocabularyService.getVocabulary(1L, WordStatus.LEARNING, 1, 20);

            assertThat(response.total()).isEqualTo(1);
            assertThat(response.words().get(0).status()).isEqualTo(WordStatus.LEARNING);
        }

        @Test
        @DisplayName("should return empty list when user has no words in vocabulary")
        void shouldReturnEmptyListWhenNoWords() {
            when(userWordStateRepository.findByUserId(eq(1L), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));

            VocabularyResponse response = vocabularyService.getVocabulary(1L, null, 1, 20);

            assertThat(response.total()).isZero();
            assertThat(response.words()).isEmpty();
        }

        @Test
        @DisplayName("should include nextRecall date in the response word")
        void shouldIncludeNextRecall() {
            LocalDate nextRecall = LocalDate.now().plusDays(7);
            Word w = word(1L, "knife");
            UserWordState s = UserWordState.builder()
                    .userId(1L)
                    .word(w)
                    .status(WordStatus.RECALLING)
                    .nextRecall(nextRecall)
                    .build();
            when(userWordStateRepository.findByUserId(eq(1L), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(s)));

            VocabularyResponse response = vocabularyService.getVocabulary(1L, null, 1, 20);

            assertThat(response.words().get(0).nextRecall()).isEqualTo(nextRecall);
        }

        @Test
        @DisplayName("should pass the correct page number to the repository (1-based input → 0-based pageable)")
        void shouldPassCorrectPageNumber() {
            when(userWordStateRepository.findByUserId(eq(1L), any(Pageable.class)))
                    .thenAnswer(inv -> {
                        Pageable p = inv.getArgument(1);
                        assertThat(p.getPageNumber()).isEqualTo(1); // page=2 → offset 1
                        assertThat(p.getPageSize()).isEqualTo(10);
                        return new PageImpl<>(List.of());
                    });

            vocabularyService.getVocabulary(1L, null, 2, 10);
        }
    }
}