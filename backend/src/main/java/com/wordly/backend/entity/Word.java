package com.wordly.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "words")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subtopic_id", nullable = false)
    private Subtopic subtopic;

    @Column(name = "word_en", nullable = false)
    private String wordEn;

    @Column(name = "transcription_en", nullable = false)
    private String transcriptionEn = "";

    @Column(name = "translation_ru", nullable = false)
    private String translationRu;

    @Column(name = "image_url", nullable = false)
    private String imageUrl = "";

    @Column(name = "usage_example_en", nullable = false)
    private String usageExampleEn = "";

    @Column(name = "usage_example_en_translation_ru", nullable = false)
    private String usageExampleEnTranslationRu = "";

    @Column(name = "mnemonic_image_url")
    private String mnemonicImageUrl;

    @Column(name = "mnemo_text")
    private String mnemoText;

    public boolean hasMnemonic() {
        return mnemonicImageUrl != null || mnemoText != null;
    }
}
