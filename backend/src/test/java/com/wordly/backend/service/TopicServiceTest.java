package com.wordly.backend.service;

import com.wordly.backend.dto.TopicDetailResponse;
import com.wordly.backend.dto.TopicsResponse;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.TopicRepository;
import com.wordly.backend.repository.UserSubtopicLevelMechanicProgressRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TopicService")
class TopicServiceTest {

    @Mock
    private TopicRepository topicRepository;
    @Mock
    private SubtopicRepository subtopicRepository;
    @Mock
    private UserSubtopicLevelMechanicProgressRepository progressRepository;
    @Mock
    private ProgressComputationService progressComputationService;

    @InjectMocks
    private TopicService topicService;

    private Topic topic(long id, int sortOrder) {
        return Topic.builder()
                .id(id)
                .name("Topic " + id)
                .description("")
                .imageUrl("")
                .sortOrder(sortOrder)
                .build();
    }

    private Subtopic subtopic(long id, Topic topic) {
        return Subtopic.builder()
                .id(id)
                .topic(topic)
                .name("Subtopic " + id)
                .description("")
                .imageUrl("")
                .sortOrder(0)
                .wordsCount(5)
                .build();
    }

    @Nested
    @DisplayName("getTopics")
    class GetTopics {

        @Test
        @DisplayName("should return all topics for a regular user")
        void shouldReturnAllTopicsForRegularUser() {
            Topic t1 = topic(1L, 1);
            Topic t2 = topic(2L, 2);
            when(topicRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of(t1, t2));
            when(progressRepository.findByUserId(1L)).thenReturn(List.of());
            when(subtopicRepository.findAllByTopic_IdInOrderByTopic_IdAscSortOrderAscIdAsc(List.of(1L, 2L)))
                    .thenReturn(List.of());
            when(progressRepository.findFirstByUserIdAndStatusOrderByStartedAtDescIdDesc(1L, ProgressStatus.IN_PROGRESS))
                    .thenReturn(Optional.empty());

            TopicsResponse response = topicService.getTopics(1L, false);

            assertThat(response.topics()).hasSize(2);
            assertThat(response.currentPosition()).isNull();
        }

        @Test
        @DisplayName("should return only the first topic for a guest user")
        void shouldReturnOnlyFirstTopicForGuest() {
            Topic firstTopic = topic(1L, 1);
            when(topicRepository.findFirstByOrderBySortOrderAscIdAsc()).thenReturn(Optional.of(firstTopic));
            when(progressRepository.findByUserId(99L)).thenReturn(List.of());
            when(subtopicRepository.findAllByTopic_IdInOrderByTopic_IdAscSortOrderAscIdAsc(List.of(1L)))
                    .thenReturn(List.of());
            when(progressRepository.findFirstByUserIdAndStatusOrderByStartedAtDescIdDesc(99L, ProgressStatus.IN_PROGRESS))
                    .thenReturn(Optional.empty());

            TopicsResponse response = topicService.getTopics(99L, true);

            assertThat(response.topics()).hasSize(1);
            assertThat(response.topics().get(0).id()).isEqualTo(1L);
        }

        @Test
        @DisplayName("should return currentPosition when user has an in-progress level")
        void shouldReturnCurrentPositionWhenInProgress() {
            Topic t = topic(1L, 1);
            Subtopic s = subtopic(10L, t);
            UserSubtopicLevelMechanicProgress inProgress = UserSubtopicLevelMechanicProgress.builder()
                    .subtopic(s)
                    .mechanicType(MechanicType.FLASHCARDS)
                    .status(ProgressStatus.IN_PROGRESS)
                    .build();

            when(topicRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of(t));
            when(progressRepository.findByUserId(1L)).thenReturn(List.of());
            when(subtopicRepository.findAllByTopic_IdInOrderByTopic_IdAscSortOrderAscIdAsc(List.of(1L)))
                    .thenReturn(List.of(s));
            when(progressComputationService.isSubtopicCompleted(s, List.of())).thenReturn(false);
            when(progressRepository.findFirstByUserIdAndStatusOrderByStartedAtDescIdDesc(1L, ProgressStatus.IN_PROGRESS))
                    .thenReturn(Optional.of(inProgress));

            TopicsResponse response = topicService.getTopics(1L, false);

            assertThat(response.currentPosition()).isNotNull();
            assertThat(response.currentPosition().subtopicId()).isEqualTo(10L);
            assertThat(response.currentPosition().mechanicType()).isEqualTo("flashcards");
        }

        @Test
        @DisplayName("should count completed subtopics correctly")
        void shouldCountCompletedSubtopics() {
            Topic t = topic(1L, 1);
            Subtopic s1 = subtopic(10L, t);
            Subtopic s2 = subtopic(11L, t);
            List<UserSubtopicLevelMechanicProgress> progress = List.of();

            when(topicRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of(t));
            when(progressRepository.findByUserId(1L)).thenReturn(progress);
            when(subtopicRepository.findAllByTopic_IdInOrderByTopic_IdAscSortOrderAscIdAsc(List.of(1L)))
                    .thenReturn(List.of(s1, s2));
            when(progressComputationService.isSubtopicCompleted(s1, progress)).thenReturn(true);
            when(progressComputationService.isSubtopicCompleted(s2, progress)).thenReturn(false);
            when(progressRepository.findFirstByUserIdAndStatusOrderByStartedAtDescIdDesc(1L, ProgressStatus.IN_PROGRESS))
                    .thenReturn(Optional.empty());

            TopicsResponse response = topicService.getTopics(1L, false);

            assertThat(response.topics().get(0).subtopicsTotal()).isEqualTo(2);
            assertThat(response.topics().get(0).subtopicsCompleted()).isEqualTo(1);
        }

        @Test
        @DisplayName("should return empty topics list with no currentPosition when there are no topics")
        void shouldReturnEmptyWhenNoTopics() {
            when(topicRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of());

            TopicsResponse response = topicService.getTopics(1L, false);

            assertThat(response.topics()).isEmpty();
            assertThat(response.currentPosition()).isNull();
        }
    }

    @Nested
    @DisplayName("getTopicDetail")
    class GetTopicDetail {

        @Test
        @DisplayName("should return topic detail with subtopic ids for a regular user")
        void shouldReturnTopicDetail() {
            Topic t = topic(1L, 1);
            Subtopic s1 = subtopic(10L, t);
            Subtopic s2 = subtopic(11L, t);

            when(topicRepository.findById(1L)).thenReturn(Optional.of(t));
            when(subtopicRepository.findByTopicOrderBySortOrderAscIdAsc(t)).thenReturn(List.of(s1, s2));

            TopicDetailResponse response = topicService.getTopicDetail(1L, 1L, false);

            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.subtopicIds()).containsExactly(10L, 11L);
        }

        @Test
        @DisplayName("should throw NotFoundException when topic does not exist")
        void shouldThrowWhenTopicNotFound() {
            when(topicRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> topicService.getTopicDetail(99L, 1L, false))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("should throw NotFoundException when guest tries to access a non-first topic")
        void shouldThrowForGuestAccessingNonFirstTopic() {
            Topic firstTopic = topic(1L, 1);
            Topic otherTopic = topic(2L, 2);

            when(topicRepository.findById(2L)).thenReturn(Optional.of(otherTopic));
            when(topicRepository.findFirstByOrderBySortOrderAscIdAsc()).thenReturn(Optional.of(firstTopic));

            assertThatThrownBy(() -> topicService.getTopicDetail(2L, 99L, true))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("should allow guest to access the first topic")
        void shouldAllowGuestToAccessFirstTopic() {
            Topic firstTopic = topic(1L, 1);

            when(topicRepository.findById(1L)).thenReturn(Optional.of(firstTopic));
            when(topicRepository.findFirstByOrderBySortOrderAscIdAsc()).thenReturn(Optional.of(firstTopic));
            when(subtopicRepository.findByTopicOrderBySortOrderAscIdAsc(firstTopic)).thenReturn(List.of());

            TopicDetailResponse response = topicService.getTopicDetail(1L, 99L, true);

            assertThat(response.id()).isEqualTo(1L);
        }
    }
}