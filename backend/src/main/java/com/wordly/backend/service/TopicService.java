package com.wordly.backend.service;

import com.wordly.backend.dto.*;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.entity.enums.ProgressStatus;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.TopicRepository;
import com.wordly.backend.repository.UserSubtopicLevelMechanicProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubtopicRepository subtopicRepository;
    private final UserSubtopicLevelMechanicProgressRepository progressRepository;
    private final ProgressComputationService progressComputationService;

    @Transactional(readOnly = true)
    public TopicsResponse getTopics(Long userId, boolean isGuest) {
        List<Topic> topics = isGuest
                ? topicRepository.findFirstByOrderBySortOrderAscIdAsc().stream().toList()
                : topicRepository.findAllByOrderBySortOrderAscIdAsc();

        if (topics.isEmpty()) {
            return new TopicsResponse(List.of(), null);
        }

        List<UserSubtopicLevelMechanicProgress> progress = progressRepository.findByUserId(userId);

        List<Long> topicIds = topics.stream()
                .map(Topic::getId)
                .toList();

        List<Subtopic> allSubtopics = subtopicRepository
                .findAllByTopic_IdInOrderByTopic_IdAscSortOrderAscIdAsc(topicIds);

        Map<Long, List<Subtopic>> subtopicsByTopicId = allSubtopics.stream()
                .collect(Collectors.groupingBy(subtopic -> subtopic.getTopic().getId()));

        List<TopicSummaryResponse> topicResponses = new ArrayList<>();
        for (Topic topic : topics) {
            List<Subtopic> subtopics = subtopicsByTopicId.getOrDefault(topic.getId(), List.of());

            int completedCount = 0;
            for (Subtopic subtopic : subtopics) {
                if (progressComputationService.isSubtopicCompleted(subtopic, progress)) {
                    completedCount++;
                }
            }

            topicResponses.add(new TopicSummaryResponse(
                    topic.getId(),
                    topic.getName(),
                    topic.getDescription(),
                    topic.getImageUrl(),
                    topic.getSortOrder(),
                    subtopics.size(),
                    completedCount
            ));
        }

        CurrentPositionResponse currentPosition = progressRepository
                .findFirstByUserIdAndStatusOrderByStartedAtDescIdDesc(userId, ProgressStatus.IN_PROGRESS)
                .map(p -> new CurrentPositionResponse(
                        p.getSubtopic().getId(),
                        p.getMechanicType().getValue()
                ))
                .orElse(null);

        return new TopicsResponse(topicResponses, currentPosition);
    }

    @Transactional(readOnly = true)
    public TopicDetailResponse getTopicDetail(Long topicId, Long userId, boolean isGuest) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Topic not found: " + topicId));

        if (isGuest) {
            Topic firstTopic = topicRepository.findFirstByOrderBySortOrderAscIdAsc()
                    .orElseThrow(() -> new NotFoundException("No topics found"));
            if (!firstTopic.getId().equals(topicId)) {
                throw new NotFoundException("Topic not found: " + topicId);
            }
        }

        List<Subtopic> subtopics = subtopicRepository.findByTopicOrderBySortOrderAscIdAsc(topic);

        List<Long> subtopicIds = subtopics.stream().map(Subtopic::getId).toList();

        return new TopicDetailResponse(
                topic.getId(),
                topic.getName(),
                topic.getDescription(),
                topic.getImageUrl(),
                subtopicIds
        );
    }
}