package com.wordly.backend.repository;

import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubtopicRepository extends JpaRepository<Subtopic, Long> {

    List<Subtopic> findByTopicOrderBySortOrderAscIdAsc(Topic topic);

    long countByTopic(Topic topic);

    Optional<Subtopic> findFirstByTopicOrderBySortOrderAscIdAsc(Topic topic);

    List<Subtopic> findAllByTopicIdOrderBySortOrderAscIdAsc(Long topicId);

    List<Subtopic> findAllByTopic_IdInOrderByTopic_IdAscSortOrderAscIdAsc(List<Long> topicIds);
}