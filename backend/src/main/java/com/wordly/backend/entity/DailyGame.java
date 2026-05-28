package com.wordly.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "daily_games")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String idiom;

    @Column(name = "option_1", nullable = false)
    private String option1;

    @Column(name = "option_2", nullable = false)
    private String option2;

    @Column(name = "option_3", nullable = false)
    private String option3;

    @Column(name = "option_4", nullable = false)
    private String option4;

    @Column(name = "correct_option", nullable = false)
    private Integer correctOption;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;
}