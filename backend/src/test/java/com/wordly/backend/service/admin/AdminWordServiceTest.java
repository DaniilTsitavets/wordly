package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminBulkWordItem;
import com.wordly.backend.dto.admin.AdminBulkWordsRequest;
import com.wordly.backend.dto.admin.AdminBulkWordsResponse;
import com.wordly.backend.dto.admin.AdminWordRequest;
import com.wordly.backend.dto.admin.AdminWordResponse;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.entity.Word;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.WordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminWordService")
class AdminWordServiceTest {

    @Mock WordRepository wordRepository;
    @Mock SubtopicRepository subtopicRepository;
    @InjectMocks AdminWordService service;

    private Topic topic(long id) {
        return Topic.builder().id(id).name("Topic").build();
    }

    private Subtopic subtopic(long id) {
        return Subtopic.builder().id(id).topic(topic(1L)).name("Sub").build();
    }

    private Word word(long id, Subtopic subtopic) {
        return Word.builder()
                .id(id).subtopic(subtopic)
                .wordEn("apple").transcriptionEn("ˈæp.əl")
                .translationRu("яблоко").imageUrl("").build();
    }

    private AdminWordRequest request(long subtopicId) {
        return new AdminWordRequest(subtopicId, "apple", "ˈæp.əl", "яблоко",
                null, null, null, null, null);
    }

    @Nested @DisplayName("listBySubtopic")
    class ListBySubtopic {

        @Test @DisplayName("returns words mapped to responses")
        void returnsWords() {
            Subtopic sub = subtopic(1L);
            when(subtopicRepository.existsById(1L)).thenReturn(true);
            when(wordRepository.findBySubtopicIdOrderByIdAsc(1L))
                    .thenReturn(List.of(word(1L, sub), word(2L, sub)));

            List<AdminWordResponse> result = service.listBySubtopic(1L);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).id()).isEqualTo(1L);
            assertThat(result.get(0).wordEn()).isEqualTo("apple");
        }

        @Test @DisplayName("throws NotFoundException when subtopic missing")
        void throwsWhenSubtopicNotFound() {
            when(subtopicRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> service.listBySubtopic(99L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested @DisplayName("create")
    class Create {

        @Test @DisplayName("saves word and returns response")
        void savesWord() {
            Subtopic sub = subtopic(1L);
            Word saved = word(10L, sub);
            when(subtopicRepository.findById(1L)).thenReturn(Optional.of(sub));
            when(wordRepository.save(any())).thenReturn(saved);

            AdminWordResponse result = service.create(request(1L));

            assertThat(result.id()).isEqualTo(10L);
            assertThat(result.subtopicId()).isEqualTo(1L);
            verify(wordRepository).save(any(Word.class));
        }

        @Test @DisplayName("trims wordEn and translationRu")
        void trimsFields() {
            Subtopic sub = subtopic(1L);
            when(subtopicRepository.findById(1L)).thenReturn(Optional.of(sub));
            ArgumentCaptor<Word> captor = ArgumentCaptor.forClass(Word.class);
            when(wordRepository.save(captor.capture())).thenReturn(word(1L, sub));

            service.create(new AdminWordRequest(1L, "  apple  ", null, "  яблоко  ",
                    null, null, null, null, null));

            assertThat(captor.getValue().getWordEn()).isEqualTo("apple");
            assertThat(captor.getValue().getTranslationRu()).isEqualTo("яблоко");
        }

        @Test @DisplayName("throws NotFoundException when subtopic missing")
        void throwsWhenSubtopicNotFound() {
            when(subtopicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(request(99L)))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test @DisplayName("blank optional fields become null")
        void blankFieldsBecomNull() {
            Subtopic sub = subtopic(1L);
            when(subtopicRepository.findById(1L)).thenReturn(Optional.of(sub));
            ArgumentCaptor<Word> captor = ArgumentCaptor.forClass(Word.class);
            when(wordRepository.save(captor.capture())).thenReturn(word(1L, sub));

            service.create(new AdminWordRequest(1L, "apple", "  ", "яблоко",
                    "  ", "  ", "  ", "  ", "  "));

            assertThat(captor.getValue().getTranscriptionEn()).isEqualTo("  ");
            assertThat(captor.getValue().getMnemoText()).isNull();
        }
    }

    @Nested @DisplayName("update")
    class Update {

        @Test @DisplayName("updates fields when subtopic unchanged")
        void updatesFields() {
            Subtopic sub = subtopic(1L);
            Word existing = word(5L, sub);
            when(wordRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(wordRepository.save(existing)).thenReturn(existing);

            AdminWordResponse result = service.update(5L, request(1L));

            assertThat(result.wordEn()).isEqualTo("apple");
            verify(subtopicRepository, never()).findById(any());
        }

        @Test @DisplayName("loads new subtopic when subtopicId changes")
        void changesSubtopic() {
            Subtopic sub1 = subtopic(1L);
            Subtopic sub2 = subtopic(2L);
            Word existing = word(5L, sub1);
            when(wordRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(subtopicRepository.findById(2L)).thenReturn(Optional.of(sub2));
            when(wordRepository.save(existing)).thenReturn(existing);

            service.update(5L, request(2L));

            assertThat(existing.getSubtopic()).isEqualTo(sub2);
        }

        @Test @DisplayName("throws NotFoundException when word missing")
        void throwsWhenWordNotFound() {
            when(wordRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.update(99L, request(1L)))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test @DisplayName("throws NotFoundException when new subtopic missing")
        void throwsWhenNewSubtopicNotFound() {
            Subtopic sub1 = subtopic(1L);
            Word existing = word(5L, sub1);
            when(wordRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(subtopicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.update(5L, request(99L)))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested @DisplayName("delete")
    class Delete {

        @Test @DisplayName("deletes word by id")
        void deletesWord() {
            Subtopic sub = subtopic(1L);
            Word existing = word(3L, sub);
            when(wordRepository.findById(3L)).thenReturn(Optional.of(existing));

            service.delete(3L);

            verify(wordRepository).delete(existing);
        }

        @Test @DisplayName("throws NotFoundException when word missing")
        void throwsWhenNotFound() {
            when(wordRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete(99L))
                    .isInstanceOf(NotFoundException.class);
            verify(wordRepository, never()).delete(any());
        }
    }

    @Nested @DisplayName("bulkCreate")
    class BulkCreate {

        @Test @DisplayName("saves all words and returns summary")
        void savesAll() {
            Subtopic sub = subtopic(1L);
            when(subtopicRepository.findById(1L)).thenReturn(Optional.of(sub));

            List<Word> saved = List.of(word(1L, sub), word(2L, sub));
            when(wordRepository.saveAll(any())).thenReturn(saved);

            AdminBulkWordsRequest req = new AdminBulkWordsRequest(1L, List.of(
                    new AdminBulkWordItem("apple", null, "яблоко", null, null, null, null, null),
                    new AdminBulkWordItem("book", null, "книга", null, null, null, null, null)
            ));

            AdminBulkWordsResponse result = service.bulkCreate(req);

            assertThat(result.created()).isEqualTo(2);
            assertThat(result.subtopicId()).isEqualTo(1L);
            assertThat(result.words()).hasSize(2);
        }

        @Test @DisplayName("throws NotFoundException when subtopic missing")
        void throwsWhenSubtopicNotFound() {
            when(subtopicRepository.findById(99L)).thenReturn(Optional.empty());

            AdminBulkWordsRequest req = new AdminBulkWordsRequest(99L, List.of());
            assertThatThrownBy(() -> service.bulkCreate(req))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}