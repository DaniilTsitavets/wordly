package com.wordly.backend.entity;

import com.wordly.backend.entity.converter.StringListJsonConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subtopics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subtopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description = "";

    @Column(name = "image_url", nullable = false)
    private String imageUrl = "";

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "words_count", nullable = false)
    private Integer wordsCount = 0;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "disabled_mechanics", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private List<String> disabledMechanics = new ArrayList<>();
}