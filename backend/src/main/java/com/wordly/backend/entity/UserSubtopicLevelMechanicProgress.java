package com.wordly.backend.entity;

import com.wordly.backend.entity.converter.MechanicTypeConverter;
import com.wordly.backend.entity.converter.ProgressStatusConverter;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_subtopic_level_mechanic_progress",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "subtopic_id", "mechanic_type"})
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSubtopicLevelMechanicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subtopic_id", nullable = false)
    private Subtopic subtopic;

    @Convert(converter = MechanicTypeConverter.class)
    @Column(name = "mechanic_type", nullable = false)
    private MechanicType mechanicType;

    @Convert(converter = ProgressStatusConverter.class)
    @Column(nullable = false)
    private ProgressStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}