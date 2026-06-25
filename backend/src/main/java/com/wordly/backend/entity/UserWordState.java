package com.wordly.backend.entity;

import com.wordly.backend.entity.converter.WordStatusConverter;
import com.wordly.backend.entity.enums.WordStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "user_word_state",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "word_id"})
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWordState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Convert(converter = WordStatusConverter.class)
    @Column(nullable = false)
    @Builder.Default
    private WordStatus status = WordStatus.NEW;

    @Column(name = "recall_interval", nullable = false)
    @Builder.Default
    private Integer recallInterval = 1;

    @Column(name = "next_recall")
    private LocalDate nextRecall;

    @Column(name = "session_date")
    private LocalDate sessionDate;

    @Column(name = "session_correct")
    private Boolean sessionCorrect;

    @Column(name = "recall_time_ms")
    private Integer recallTimeMs;
}
