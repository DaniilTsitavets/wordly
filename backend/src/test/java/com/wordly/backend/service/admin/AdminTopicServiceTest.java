package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminTopicRequest;
import com.wordly.backend.dto.admin.AdminTopicResponse;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.TopicRepository;
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
@DisplayName("AdminTopicService")
class AdminTopicServiceTest {

    @Mock TopicRepository topicRepository;
    @Mock SubtopicRepository subtopicRepository;
    @InjectMocks AdminTopicService service;

    private Topic topic(long id) {
        return Topic.builder().id(id).name("Topic " + id).description("").imageUrl("").sortOrder(0).build();
    }

    private AdminTopicRequest request() {
        return new AdminTopicRequest("Grammar", "Learn grammar", null, 1);
    }

    @Nested @DisplayName("list")
    class List_ {

        @Test @DisplayName("returns all topics with subtopic counts")
        void returnsTopics() {
            Topic t1 = topic(1L);
            Topic t2 = topic(2L);
            when(topicRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of(t1, t2));
            when(subtopicRepository.countGroupedByTopic()).thenReturn(List.of(
                    stubCount(1L, 3L), stubCount(2L, 0L)
            ));

            List<AdminTopicResponse> result = service.list();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).subtopicsCount()).isEqualTo(3L);
            assertThat(result.get(1).subtopicsCount()).isEqualTo(0L);
        }

        @Test @DisplayName("returns empty list when no topics exist")
        void returnsEmpty() {
            when(topicRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of());
            when(subtopicRepository.countGroupedByTopic()).thenReturn(List.of());

            assertThat(service.list()).isEmpty();
        }
    }

    @Nested @DisplayName("create")
    class Create {

        @Test @DisplayName("saves topic and returns response with 0 subtopics")
        void savesTopic() {
            Topic saved = topic(10L);
            when(topicRepository.save(any())).thenReturn(saved);

            AdminTopicResponse result = service.create(request());

            assertThat(result.id()).isEqualTo(10L);
            assertThat(result.subtopicsCount()).isEqualTo(0L);
        }

        @Test @DisplayName("defaults sortOrder to 0 when null")
        void defaultsSortOrder() {
            ArgumentCaptor<Topic> captor = ArgumentCaptor.forClass(Topic.class);
            when(topicRepository.save(captor.capture())).thenReturn(topic(1L));

            service.create(new AdminTopicRequest("Grammar", null, null, null));

            assertThat(captor.getValue().getSortOrder()).isEqualTo(0);
        }

        @Test @DisplayName("trims name")
        void trimsName() {
            ArgumentCaptor<Topic> captor = ArgumentCaptor.forClass(Topic.class);
            when(topicRepository.save(captor.capture())).thenReturn(topic(1L));

            service.create(new AdminTopicRequest("  Grammar  ", null, null, 0));

            assertThat(captor.getValue().getName()).isEqualTo("Grammar");
        }

        @Test @DisplayName("blank imageUrl becomes empty string")
        void blankImageUrlBecomesNull() {
            ArgumentCaptor<Topic> captor = ArgumentCaptor.forClass(Topic.class);
            when(topicRepository.save(captor.capture())).thenReturn(topic(1L));

            service.create(new AdminTopicRequest("Grammar", null, "  ", 0));

            assertThat(captor.getValue().getImageUrl()).isEqualTo("  ");
        }
    }

    @Nested @DisplayName("update")
    class Update {

        @Test @DisplayName("updates topic fields and returns updated response")
        void updatesFields() {
            Topic existing = topic(5L);
            when(topicRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(topicRepository.save(existing)).thenReturn(existing);
            when(subtopicRepository.countByTopic(existing)).thenReturn(2L);

            AdminTopicResponse result = service.update(5L, new AdminTopicRequest("New Name", "Desc", null, 3));

            assertThat(result.name()).isEqualTo("New Name");
            assertThat(result.subtopicsCount()).isEqualTo(2L);
        }

        @Test @DisplayName("keeps existing sortOrder when request has null")
        void keepsSortOrderWhenNull() {
            Topic existing = topic(5L);
            existing.setSortOrder(7);
            when(topicRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(topicRepository.save(existing)).thenReturn(existing);
            when(subtopicRepository.countByTopic(existing)).thenReturn(0L);

            service.update(5L, new AdminTopicRequest("Name", null, null, null));

            assertThat(existing.getSortOrder()).isEqualTo(7);
        }

        @Test @DisplayName("throws NotFoundException when topic missing")
        void throwsWhenNotFound() {
            when(topicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.update(99L, request()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested @DisplayName("delete")
    class Delete {

        @Test @DisplayName("deletes topic when no subtopics exist")
        void deletesWhenEmpty() {
            Topic existing = topic(3L);
            when(topicRepository.findById(3L)).thenReturn(Optional.of(existing));
            when(subtopicRepository.countByTopic(existing)).thenReturn(0L);

            service.delete(3L);

            verify(topicRepository).delete(existing);
        }

        @Test @DisplayName("throws IllegalArgumentException when topic has subtopics")
        void throwsWhenHasSubtopics() {
            Topic existing = topic(3L);
            when(topicRepository.findById(3L)).thenReturn(Optional.of(existing));
            when(subtopicRepository.countByTopic(existing)).thenReturn(2L);

            assertThatThrownBy(() -> service.delete(3L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("2");
            verify(topicRepository, never()).delete(any());
        }

        @Test @DisplayName("throws NotFoundException when topic missing")
        void throwsWhenNotFound() {
            when(topicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete(99L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    private SubtopicRepository.TopicSubtopicCount stubCount(long topicId, long cnt) {
        return new SubtopicRepository.TopicSubtopicCount() {
            public Long getTopicId() { return topicId; }
            public Long getCnt() { return cnt; }
        };
    }
}