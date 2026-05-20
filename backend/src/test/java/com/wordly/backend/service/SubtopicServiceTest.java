package com.wordly.backend.service;

import com.wordly.backend.dto.LevelProgressResponse;
import com.wordly.backend.dto.SubtopicDetailResponse;
import com.wordly.backend.dto.SubtopicSummaryResponse;
import com.wordly.backend.dto.SubtopicWordsResponse;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.entity.Word;
import com.wordly.backend.entity.enums.ProgressStatus;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.TopicRepository;
import com.wordly.backend.repository.UserSubtopicLevelMechanicProgressRepository;
import com.wordly.backend.repository.WordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubtopicService")
class SubtopicServiceTest {

    @Mock
    private SubtopicRepository subtopicRepository;
    @Mock
    private TopicRepository topicRepository;
    @Mock
    private WordRepository wordRepository;
    @Mock
    private UserSubtopicLevelMechanicProgressRepository progressRepository;
    @Mock
    private ProgressComputationService progressComputationService;

    @InjectMocks
    private SubtopicService subtopicService;

    private Topic topic(long id) {
        return Topic.builder().id(id).name("Topic " + id).description("").imageUrl("").sortOrder(0).build();
    }

    private Subtopic subtopic(long id, Topic topic) {
        return Subtopic.builder()
                .id(id)
                .topic(topic)
                .name("Subtopic " + id)
                .description("desc")
                .imageUrl("img.jpg")
                .sortOrder(0)
                .wordsCount(5)
                .build();
    }

    private Word word(long id, String wordEn) {
        return Word.builder()
                .id(id)
                .wordEn(wordEn)
                .translationRu("перевод")
                .transcriptionEn("trænskrɪpʃən")
                .build();
    }

    @Nested
    @DisplayName("getSubtopicDetail")
    class GetSubtopicDetail {

        @Test
        @DisplayName("should return subtopic detail with level progress for a regular user")
        void shouldReturnDetailForRegularUser() {
            Topic t = topic(1L);
            Subtopic s = subtopic(10L, t);
            List<LevelProgressResponse> levels = List.of();
            when(subtopicRepository.findById(10L)).thenReturn(Optional.of(s));
            when(progressRepository.findByUserIdAndSubtopicId(1L, 10L)).thenReturn(List.of());
            when(progressComputationService.buildLevelProgress(s, List.of())).thenReturn(levels);

            SubtopicDetailResponse response = subtopicService.getSubtopicDetail(10L, 1L, false);

            assertThat(response.id()).isEqualTo(10L);
            assertThat(response.name()).isEqualTo("Subtopic 10");
            assertThat(response.wordsCount()).isEqualTo(5);
            assertThat(response.levels()).isSameAs(levels);
        }

        @Test
        @DisplayName("should throw NotFoundException when subtopic does not exist")
        void shouldThrowWhenSubtopicNotFound() {
            when(subtopicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> subtopicService.getSubtopicDetail(99L, 1L, false))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getSubtopicWords")
    class GetSubtopicWords {

        @Test
        @DisplayName("should include mnemonic info for words that have mnemonics")
        void shouldIncludeMnemonicInfo() {
            Topic t = topic(1L);
            Subtopic s = subtopic(10L, t);
            Word withMnemonic = Word.builder()
                    .id(1L)
                    .wordEn("plate")
                    .translationRu("тарелка")
                    .transcriptionEn("pleɪt")
                    .mnemonicImageUrl("https://img.example.com/plate.jpg")
                    .mnemoText("A plate is flat")
                    .build();
            Word noMnemonic = word(2L, "fork");

            when(subtopicRepository.findById(10L)).thenReturn(Optional.of(s));
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(List.of(withMnemonic, noMnemonic));

            SubtopicWordsResponse response = subtopicService.getSubtopicWords(10L, 1L, false);

            assertThat(response.words()).hasSize(2);
            assertThat(response.words().get(0).hasMnemonic()).isTrue();
            assertThat(response.words().get(0).mnemoDescription()).isEqualTo("A plate is flat");
            assertThat(response.words().get(1).hasMnemonic()).isFalse();
            assertThat(response.words().get(1).mnemoDescription()).isNull();
        }

        @Test
        @DisplayName("should return empty list when subtopic has no words")
        void shouldReturnEmptyWhenNoWords() {
            Topic t = topic(1L);
            Subtopic s = subtopic(10L, t);
            when(subtopicRepository.findById(10L)).thenReturn(Optional.of(s));
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(List.of());

            SubtopicWordsResponse response = subtopicService.getSubtopicWords(10L, 1L, false);

            assertThat(response.words()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getSubtopicsByIds")
    class GetSubtopicsByIds {

        @Test
        @DisplayName("should delegate to progressComputationService and return summaries")
        void shouldReturnSummaries() {
            Topic t = topic(1L);
            Subtopic s1 = subtopic(1L, t);
            Subtopic s2 = subtopic(2L, t);
            List<UserSubtopicLevelMechanicProgress> progress = List.of();
            List<SubtopicSummaryResponse> summaries = List.of(
                    new SubtopicSummaryResponse(1L, "Subtopic 1", "", "", 0, 5, List.of(), ProgressStatus.UNBLOCKED),
                    new SubtopicSummaryResponse(2L, "Subtopic 2", "", "", 1, 5, List.of(), ProgressStatus.LOCKED)
            );

            when(subtopicRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(s1, s2));
            when(progressRepository.findByUserId(10L)).thenReturn(progress);
            when(progressComputationService.buildSubtopicSummaries(List.of(s1, s2), progress, 10L))
                    .thenReturn(summaries);

            List<SubtopicSummaryResponse> result = subtopicService.getSubtopicsByIds(List.of(1L, 2L), 10L);

            assertThat(result).isSameAs(summaries);
        }
    }

    @Nested
    @DisplayName("getAccessibleSubtopic")
    class GetAccessibleSubtopic {

        @Test
        @DisplayName("should return any subtopic for a regular user")
        void shouldReturnSubtopicForRegularUser() {
            Topic t = topic(2L);
            Subtopic s = subtopic(20L, t);
            when(subtopicRepository.findById(20L)).thenReturn(Optional.of(s));

            Subtopic result = subtopicService.getAccessibleSubtopic(20L, false);

            assertThat(result.getId()).isEqualTo(20L);
        }

        @Test
        @DisplayName("should return subtopic for guest when it belongs to the first topic")
        void shouldReturnSubtopicForGuestInFirstTopic() {
            Topic firstTopic = topic(1L);
            Subtopic s = subtopic(10L, firstTopic);
            when(subtopicRepository.findById(10L)).thenReturn(Optional.of(s));
            when(topicRepository.findFirstByOrderBySortOrderAscIdAsc()).thenReturn(Optional.of(firstTopic));

            Subtopic result = subtopicService.getAccessibleSubtopic(10L, true);

            assertThat(result.getId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("should throw NotFoundException when guest tries to access a subtopic outside the first topic")
        void shouldThrowForGuestAccessingOtherTopic() {
            Topic firstTopic = topic(1L);
            Topic otherTopic = topic(2L);
            Subtopic s = subtopic(20L, otherTopic);
            when(subtopicRepository.findById(20L)).thenReturn(Optional.of(s));
            when(topicRepository.findFirstByOrderBySortOrderAscIdAsc()).thenReturn(Optional.of(firstTopic));

            assertThatThrownBy(() -> subtopicService.getAccessibleSubtopic(20L, true))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("should throw NotFoundException when the subtopic does not exist")
        void shouldThrowWhenSubtopicNotFound() {
            when(subtopicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> subtopicService.getAccessibleSubtopic(99L, false))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}