package com.wordly.backend.repository;

import com.wordly.backend.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findAllByOrderBySortOrderAscIdAsc();

    Optional<Topic> findFirstByOrderBySortOrderAscIdAsc();
}