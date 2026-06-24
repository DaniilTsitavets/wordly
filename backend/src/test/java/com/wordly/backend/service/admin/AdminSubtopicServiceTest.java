package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminSubtopicRequest;
import com.wordly.backend.dto.admin.AdminSubtopicResponse;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.TopicRepository;
import com.wordly.backend.repository.WordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminSubtopicService")
class AdminSubtopicServiceTest {

    @Mock SubtopicRepository subtopicRepository;
    @Mock TopicRepository topicRepository;
    @Mock WordRepository wordRepository;
    @InjectMocks AdminSubtopicService service;

    private Topic topic(long id) {
        return Topic.builder().id(id).name("Topic " + id).build();
    }

    private Subtopic subtopic(long id, Topic topic) {
        return Subtopic.builder()
                .id(id).topic(topic).name("Sub " + id)
                .description("").imageUrl("").sortOrder(0).wordsCount(0)
                .disabledMechanics(new ArrayList<>()).build();
    }

    private AdminSubtopicRequest request(long topicId) {
        return new AdminSubtopicRequest(topicId, "Grammar", "Desc", null, 1, null);
    }

    @Nested @DisplayName("listByTopic")
    class ListByTopic {

        @Test @DisplayName("returns subtopics for a known topic")
        void returnsList() {
            Topic t = topic(1L);
            when(topicRepository.findById(1L)).thenReturn(Optional.of(t));
            when(subtopicRepository.findAllByTopicIdOrderBySortOrderAscIdAsc(1L))
                    .thenReturn(List.of(subtopic(1L, t), subtopic(2L, t)));

            List<AdminSubtopicResponse> result = service.listByTopic(1L);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).topicId()).isEqualTo(1L);
        }

        @Test @DisplayName("throws NotFoundException when topic missing")
        void throwsWhenTopicNotFound() {
            when(topicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.listByTopic(99L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested @DisplayName("create")
    class Create {

        @Test @DisplayName("saves subtopic and returns response")
        void savesSubtopic() {
            Topic t = topic(1L);
            Subtopic saved = subtopic(10L, t);
            when(topicRepository.findById(1L)).thenReturn(Optional.of(t));
            when(subtopicRepository.save(any())).thenReturn(saved);

            AdminSubtopicResponse result = service.create(request(1L));

            assertThat(result.id()).isEqualTo(10L);
            assertThat(result.topicId()).isEqualTo(1L);
        }

        @Test @DisplayName("defaults sortOrder to 0 when null")
        void defaultsSortOrder() {
            Topic t = topic(1L);
            when(topicRepository.findById(1L)).thenReturn(Optional.of(t));
            ArgumentCaptor<Subtopic> captor = ArgumentCaptor.forClass(Subtopic.class);
            when(subtopicRepository.save(captor.capture())).thenReturn(subtopic(1L, t));

            service.create(new AdminSubtopicRequest(1L, "Grammar", null, null, null, null));

            assertThat(captor.getValue().getSortOrder()).isEqualTo(0);
        }

        @Test @DisplayName("disabled mechanics list is mapped from enum values")
        void mapsDisabledMechanics() {
            Topic t = topic(1L);
            when(topicRepository.findById(1L)).thenReturn(Optional.of(t));
            ArgumentCaptor<Subtopic> captor = ArgumentCaptor.forClass(Subtopic.class);
            when(subtopicRepository.save(captor.capture())).thenReturn(subtopic(1L, t));

            service.create(new AdminSubtopicRequest(1L, "Grammar", null, null, 0,
                    List.of(MechanicType.MATCHING)));

            assertThat(captor.getValue().getDisabledMechanics())
                    .containsExactly(MechanicType.MATCHING.getValue());
        }

        @Test @DisplayName("null disabled mechanics defaults to empty list")
        void nullDisabledMechanicsDefaultsToEmpty() {
            Topic t = topic(1L);
            when(topicRepository.findById(1L)).thenReturn(Optional.of(t));
            ArgumentCaptor<Subtopic> captor = ArgumentCaptor.forClass(Subtopic.class);
            when(subtopicRepository.save(captor.capture())).thenReturn(subtopic(1L, t));

            service.create(new AdminSubtopicRequest(1L, "Grammar", null, null, 0, null));

            assertThat(captor.getValue().getDisabledMechanics()).isEmpty();
        }

        @Test @DisplayName("throws NotFoundException when topic missing")
        void throwsWhenTopicNotFound() {
            when(topicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(request(99L)))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested @DisplayName("update")
    class Update {

        @Test @DisplayName("updates fields when topic unchanged")
        void updatesFields() {
            Topic t = topic(1L);
            Subtopic existing = subtopic(5L, t);
            when(subtopicRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(subtopicRepository.save(existing)).thenReturn(existing);

            AdminSubtopicResponse result = service.update(5L, request(1L));

            assertThat(result.name()).isEqualTo("Grammar");
            verify(topicRepository, never()).findById(any());
        }

        @Test @DisplayName("loads new topic when topicId changes")
        void changesTopic() {
            Topic t1 = topic(1L);
            Topic t2 = topic(2L);
            Subtopic existing = subtopic(5L, t1);
            when(subtopicRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(topicRepository.findById(2L)).thenReturn(Optional.of(t2));
            when(subtopicRepository.save(existing)).thenReturn(existing);

            service.update(5L, request(2L));

            assertThat(existing.getTopic()).isEqualTo(t2);
        }

        @Test @DisplayName("skips sortOrder update when null in request")
        void skipsSortOrderWhenNull() {
            Topic t = topic(1L);
            Subtopic existing = subtopic(5L, t);
            existing.setSortOrder(7);
            when(subtopicRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(subtopicRepository.save(existing)).thenReturn(existing);

            service.update(5L, new AdminSubtopicRequest(1L, "Grammar", null, null, null, null));

            assertThat(existing.getSortOrder()).isEqualTo(7);
        }

        @Test @DisplayName("throws NotFoundException when subtopic missing")
        void throwsWhenSubtopicNotFound() {
            when(subtopicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.update(99L, request(1L)))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test @DisplayName("throws NotFoundException when new topic missing")
        void throwsWhenNewTopicNotFound() {
            Topic t1 = topic(1L);
            Subtopic existing = subtopic(5L, t1);
            when(subtopicRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(topicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.update(5L, request(99L)))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested @DisplayName("delete")
    class Delete {

        @Test @DisplayName("deletes subtopic when no words exist")
        void deletesWhenEmpty() {
            Topic t = topic(1L);
            Subtopic existing = subtopic(3L, t);
            when(subtopicRepository.findById(3L)).thenReturn(Optional.of(existing));
            when(wordRepository.countBySubtopicId(3L)).thenReturn(0L);

            service.delete(3L);

            verify(subtopicRepository).delete(existing);
        }

        @Test @DisplayName("throws IllegalArgumentException when subtopic has words")
        void throwsWhenHasWords() {
            Topic t = topic(1L);
            Subtopic existing = subtopic(3L, t);
            when(subtopicRepository.findById(3L)).thenReturn(Optional.of(existing));
            when(wordRepository.countBySubtopicId(3L)).thenReturn(5L);

            assertThatThrownBy(() -> service.delete(3L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("5");
            verify(subtopicRepository, never()).delete(any());
        }

        @Test @DisplayName("throws NotFoundException when subtopic missing")
        void throwsWhenNotFound() {
            when(subtopicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete(99L))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}