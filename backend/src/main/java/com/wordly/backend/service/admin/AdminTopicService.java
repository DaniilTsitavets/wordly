package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminTopicRequest;
import com.wordly.backend.dto.admin.AdminTopicResponse;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminTopicService {

    private final TopicRepository topicRepository;
    private final SubtopicRepository subtopicRepository;

    @Transactional(readOnly = true)
    public List<AdminTopicResponse> list() {
        List<Topic> topics = topicRepository.findAllByOrderBySortOrderAscIdAsc();
        Map<Long, Long> countsByTopicId = subtopicRepository.countGroupedByTopic().stream()
                .collect(Collectors.toMap(
                        SubtopicRepository.TopicSubtopicCount::getTopicId,
                        SubtopicRepository.TopicSubtopicCount::getCnt
                ));
        return topics.stream()
                .map(t -> AdminTopicResponse.of(t, countsByTopicId.getOrDefault(t.getId(), 0L)))
                .toList();
    }

    @Transactional
    public AdminTopicResponse create(AdminTopicRequest request) {
        Topic topic = Topic.builder()
                .name(request.name().trim())
                .description(safe(request.description()))
                .imageUrl(blankToNull(request.imageUrl()))
                .sortOrder(request.sortOrder() == null ? Integer.valueOf(0) : request.sortOrder())
                .build();
        Topic saved = topicRepository.save(topic);
        log.info("Admin created topic id={}", saved.getId());
        return AdminTopicResponse.of(saved, 0L);
    }

    @Transactional
    public AdminTopicResponse update(Long topicId, AdminTopicRequest request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Topic not found: " + topicId));

        topic.setName(request.name().trim());
        topic.setDescription(safe(request.description()));
        topic.setImageUrl(blankToNull(request.imageUrl()));
        topic.setSortOrder(request.sortOrder() == null ? topic.getSortOrder() : request.sortOrder());

        Topic saved = topicRepository.save(topic);
        log.info("Admin updated topic id={}", saved.getId());
        return AdminTopicResponse.of(saved, subtopicRepository.countByTopic(saved));
    }

    @Transactional
    public void delete(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Topic not found: " + topicId));

        long subtopics = subtopicRepository.countByTopic(topic);
        if (subtopics > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete topic with subtopics. Remove " + subtopics + " subtopic(s) first."
            );
        }

        topicRepository.delete(topic);
        log.info("Admin deleted topic id={}", topicId);
    }
    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
    private static String safe(String value) {
        return value == null ? "" : value;
    }
}