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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSubtopicService {

    private final SubtopicRepository subtopicRepository;
    private final TopicRepository topicRepository;
    private final WordRepository wordRepository;

    @Transactional(readOnly = true)
    public List<AdminSubtopicResponse> listByTopic(Long topicId) {
        topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Topic not found: " + topicId));
        return subtopicRepository.findAllByTopicIdOrderBySortOrderAscIdAsc(topicId).stream()
                .map(AdminSubtopicResponse::of)
                .toList();
    }

    @Transactional
    public AdminSubtopicResponse create(AdminSubtopicRequest request) {
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new NotFoundException("Topic not found: " + request.topicId()));

        Subtopic subtopic = Subtopic.builder()
                .topic(topic)
                .name(request.name().trim())
                .description(safe(request.description()))
                .imageUrl(blankToNull(request.imageUrl()))
                .sortOrder(request.sortOrder() == null ? 0 : request.sortOrder())
                .wordsCount(0)
                .disabledMechanics(toMechanicValues(request.disabledMechanics()))
                .build();

        Subtopic saved = subtopicRepository.save(subtopic);
        log.info("Admin created subtopic id={} (topic={})", saved.getId(), topic.getId());
        return AdminSubtopicResponse.of(saved);
    }

    @Transactional
    public AdminSubtopicResponse update(Long subtopicId, AdminSubtopicRequest request) {
        Subtopic subtopic = subtopicRepository.findById(subtopicId)
                .orElseThrow(() -> new NotFoundException("Subtopic not found: " + subtopicId));

        if (!subtopic.getTopic().getId().equals(request.topicId())) {
            Topic newTopic = topicRepository.findById(request.topicId())
                    .orElseThrow(() -> new NotFoundException("Topic not found: " + request.topicId()));
            subtopic.setTopic(newTopic);
        }

        subtopic.setName(request.name().trim());
        subtopic.setDescription(safe(request.description()));
        subtopic.setImageUrl(blankToNull(request.imageUrl()));
        if (request.sortOrder() != null) {
            subtopic.setSortOrder(request.sortOrder());
        }
        subtopic.setDisabledMechanics(toMechanicValues(request.disabledMechanics()));

        Subtopic saved = subtopicRepository.save(subtopic);
        log.info("Admin updated subtopic id={}", saved.getId());
        return AdminSubtopicResponse.of(saved);
    }

    @Transactional
    public void delete(Long subtopicId) {
        Subtopic subtopic = subtopicRepository.findById(subtopicId)
                .orElseThrow(() -> new NotFoundException("Subtopic not found: " + subtopicId));

        long words = wordRepository.countBySubtopicId(subtopicId);
        if (words > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete subtopic with words. Remove " + words + " word(s) first."
            );
        }

        subtopicRepository.delete(subtopic);
        log.info("Admin deleted subtopic id={}", subtopicId);
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    private static List<String> toMechanicValues(List<MechanicType> mechanics) {
        if (mechanics == null) {
            return new ArrayList<>();
        }
        return mechanics.stream()
                .filter(java.util.Objects::nonNull)
                .map(MechanicType::getValue)
                .distinct()
                .toList();
    }
}