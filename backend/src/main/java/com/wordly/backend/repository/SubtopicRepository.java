package com.wordly.backend.repository;

import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SubtopicRepository extends JpaRepository<Subtopic, Long> {

    List<Subtopic> findByTopicOrderBySortOrderAscIdAsc(Topic topic);

    long countByTopic(Topic topic);

    Optional<Subtopic> findFirstByTopicOrderBySortOrderAscIdAsc(Topic topic);

    List<Subtopic> findAllByTopicIdOrderBySortOrderAscIdAsc(Long topicId);

    List<Subtopic> findAllByTopic_IdInOrderByTopic_IdAscSortOrderAscIdAsc(List<Long> topicIds);

    @Query("SELECT s.topic.id AS topicId, COUNT(s) AS cnt FROM Subtopic s GROUP BY s.topic.id")
    List<TopicSubtopicCount> countGroupedByTopic();

    interface TopicSubtopicCount {
        Long getTopicId();
        Long getCnt();
    }
}