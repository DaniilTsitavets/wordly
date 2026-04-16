package com.wordly.backend.repository;

import com.wordly.backend.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findBySubtopicIdOrderByIdAsc(Long subtopicId);

    boolean existsBySubtopicIdAndMnemonicImageUrlIsNotNull(Long subtopicId);

    boolean existsBySubtopicIdAndMnemoTextIsNotNull(Long subtopicId);
}