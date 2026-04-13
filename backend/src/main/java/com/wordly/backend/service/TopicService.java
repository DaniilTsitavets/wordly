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

        List<UserSubtopicLevelMechanicProgress> progress = progressRepository.findByUserId(userId);

        List<TopicSummaryResponse> topicResponses = new ArrayList<>();
        for (Topic topic : topics) {
            List<Subtopic> subtopics = subtopicRepository.findByTopicOrderBySortOrderAscIdAsc(topic);

            int completedCount = 0;
            for (Subtopic subtopic : subtopics) {
                if (progressComputationService.isSubtopicCompleted(subtopic, progress, userId)) {
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
        List<UserSubtopicLevelMechanicProgress> progress = progressRepository.findByUserId(userId);

        List<SubtopicSummaryResponse> subtopicResponses =
                progressComputationService.buildSubtopicSummaries(subtopics, progress, userId);

        return new TopicDetailResponse(
                topic.getId(),
                topic.getName(),
                topic.getDescription(),
                topic.getImageUrl(),
                subtopicResponses
        );
    }
}