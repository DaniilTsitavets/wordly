package com.wordly.backend.service;

import com.wordly.backend.dto.LevelProgressResponse;
import com.wordly.backend.dto.SubtopicSummaryResponse;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ProgressComputationService")
class ProgressComputationServiceTest {

    private ProgressComputationService service;

    @BeforeEach
    void setUp() {
        service = new ProgressComputationService();
    }

    private Subtopic subtopic(long id, List<String> disabledMechanics) {
        return Subtopic.builder()
                .id(id)
                .name("Subtopic " + id)
                .description("")
                .imageUrl("")
                .sortOrder(0)
                .wordsCount(5)
                .disabledMechanics(disabledMechanics)
                .build();
    }

    private UserSubtopicLevelMechanicProgress progress(Subtopic subtopic, MechanicType mechanic, ProgressStatus status) {
        return UserSubtopicLevelMechanicProgress.builder()
                .subtopic(subtopic)
                .mechanicType(mechanic)
                .status(status)
                .build();
    }

    @Nested
    @DisplayName("getActiveMechanics")
    class GetActiveMechanics {

        @Test
        @DisplayName("should return all 5 mechanics when none are disabled")
        void shouldReturnAllWhenNoneDisabled() {
            Subtopic s = subtopic(1L, List.of());
            List<MechanicType> result = service.getActiveMechanics(s);
            assertThat(result).containsExactly(
                    MechanicType.MNEMONIC_CARDS,
                    MechanicType.FLASHCARDS,
                    MechanicType.MATCHING,
                    MechanicType.FILLING_GAPS,
                    MechanicType.WORD_BUILDER
            );
        }

        @Test
        @DisplayName("should exclude disabled mechanics and preserve fixed order")
        void shouldExcludeDisabledMechanicsInOrder() {
            Subtopic s = subtopic(1L, List.of("mnemonic_cards", "matching"));
            List<MechanicType> result = service.getActiveMechanics(s);
            assertThat(result).containsExactly(
                    MechanicType.FLASHCARDS,
                    MechanicType.FILLING_GAPS,
                    MechanicType.WORD_BUILDER
            );
        }

        @Test
        @DisplayName("should return empty list when all mechanics are disabled")
        void shouldReturnEmptyWhenAllDisabled() {
            Subtopic s = subtopic(1L, List.of(
                    "mnemonic_cards", "flashcards", "matching", "filling_gaps", "word_builder"
            ));
            assertThat(service.getActiveMechanics(s)).isEmpty();
        }
    }

    @Nested
    @DisplayName("isSubtopicCompleted")
    class IsSubtopicCompleted {

        @Test
        @DisplayName("should return false when there is no progress at all")
        void shouldReturnFalseWhenNoProgress() {
            Subtopic s = subtopic(1L, List.of("mnemonic_cards"));
            assertThat(service.isSubtopicCompleted(s, List.of())).isFalse();
        }

        @Test
        @DisplayName("should return true when all active mechanics are completed")
        void shouldReturnTrueWhenAllCompleted() {
            Subtopic s = subtopic(1L, List.of("mnemonic_cards"));
            List<UserSubtopicLevelMechanicProgress> prog = List.of(
                    progress(s, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED),
                    progress(s, MechanicType.MATCHING, ProgressStatus.COMPLETED),
                    progress(s, MechanicType.FILLING_GAPS, ProgressStatus.COMPLETED),
                    progress(s, MechanicType.WORD_BUILDER, ProgressStatus.COMPLETED)
            );
            assertThat(service.isSubtopicCompleted(s, prog)).isTrue();
        }

        @Test
        @DisplayName("should return false when at least one active mechanic is not completed")
        void shouldReturnFalseWhenNotAllCompleted() {
            Subtopic s = subtopic(1L, List.of("mnemonic_cards"));
            List<UserSubtopicLevelMechanicProgress> prog = List.of(
                    progress(s, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED),
                    progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS)
            );
            assertThat(service.isSubtopicCompleted(s, prog)).isFalse();
        }

        @Test
        @DisplayName("should ignore progress records that belong to a different subtopic")
        void shouldIgnoreProgressForOtherSubtopics() {
            Subtopic target = subtopic(1L, List.of("mnemonic_cards"));
            Subtopic other = subtopic(2L, List.of("mnemonic_cards"));
            List<UserSubtopicLevelMechanicProgress> prog = List.of(
                    progress(other, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED),
                    progress(other, MechanicType.MATCHING, ProgressStatus.COMPLETED),
                    progress(other, MechanicType.FILLING_GAPS, ProgressStatus.COMPLETED),
                    progress(other, MechanicType.WORD_BUILDER, ProgressStatus.COMPLETED)
            );
            assertThat(service.isSubtopicCompleted(target, prog)).isFalse();
        }
    }

    @Nested
    @DisplayName("buildLevelProgress")
    class BuildLevelProgress {

        @Test
        @DisplayName("should mark first mechanic UNBLOCKED and the rest LOCKED when there is no progress")
        void shouldMarkFirstUnblockedRestLockedWhenNoProgress() {
            Subtopic s = subtopic(1L, List.of("mnemonic_cards"));

            List<LevelProgressResponse> result = service.buildLevelProgress(s, List.of());

            assertThat(result).hasSize(4);
            assertThat(result.get(0).mechanicType()).isEqualTo(MechanicType.FLASHCARDS);
            assertThat(result.get(0).status()).isEqualTo(ProgressStatus.UNBLOCKED);
            assertThat(result.get(1).status()).isEqualTo(ProgressStatus.LOCKED);
            assertThat(result.get(2).status()).isEqualTo(ProgressStatus.LOCKED);
            assertThat(result.get(3).status()).isEqualTo(ProgressStatus.LOCKED);
        }

        @Test
        @DisplayName("should unblock the next mechanic when the current one is completed")
        void shouldUnblockNextWhenCurrentCompleted() {
            Subtopic s = subtopic(1L, List.of("mnemonic_cards"));
            List<UserSubtopicLevelMechanicProgress> subtopicProgress = List.of(
                    progress(s, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED)
            );

            List<LevelProgressResponse> result = service.buildLevelProgress(s, subtopicProgress);

            assertThat(result.get(0).status()).isEqualTo(ProgressStatus.COMPLETED);
            assertThat(result.get(1).mechanicType()).isEqualTo(MechanicType.MATCHING);
            assertThat(result.get(1).status()).isEqualTo(ProgressStatus.UNBLOCKED);
            assertThat(result.get(2).status()).isEqualTo(ProgressStatus.LOCKED);
            assertThat(result.get(3).status()).isEqualTo(ProgressStatus.LOCKED);
        }

        @Test
        @DisplayName("should reflect actual progress statuses from database records")
        void shouldReflectActualStatusesFromDB() {
            Subtopic s = subtopic(1L, List.of("mnemonic_cards"));
            List<UserSubtopicLevelMechanicProgress> subtopicProgress = List.of(
                    progress(s, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED),
                    progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS)
            );

            List<LevelProgressResponse> result = service.buildLevelProgress(s, subtopicProgress);

            assertThat(result.get(0).status()).isEqualTo(ProgressStatus.COMPLETED);
            assertThat(result.get(1).status()).isEqualTo(ProgressStatus.IN_PROGRESS);
            assertThat(result.get(2).status()).isEqualTo(ProgressStatus.LOCKED);
            assertThat(result.get(3).status()).isEqualTo(ProgressStatus.LOCKED);
        }

        @Test
        @DisplayName("should mark all mechanics UNBLOCKED/COMPLETED when all are completed")
        void shouldMarkAllCompletedWhenAllDone() {
            Subtopic s = subtopic(1L, List.of("mnemonic_cards"));
            List<UserSubtopicLevelMechanicProgress> subtopicProgress = List.of(
                    progress(s, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED),
                    progress(s, MechanicType.MATCHING, ProgressStatus.COMPLETED),
                    progress(s, MechanicType.FILLING_GAPS, ProgressStatus.COMPLETED),
                    progress(s, MechanicType.WORD_BUILDER, ProgressStatus.COMPLETED)
            );

            List<LevelProgressResponse> result = service.buildLevelProgress(s, subtopicProgress);

            assertThat(result).allMatch(r -> r.status() == ProgressStatus.COMPLETED);
        }
    }

    @Nested
    @DisplayName("buildSubtopicSummaries")
    class BuildSubtopicSummaries {

        @Test
        @DisplayName("should mark first subtopic UNBLOCKED and second LOCKED when no progress")
        void shouldMarkFirstUnblockedAndSecondLockedWhenNoProgress() {
            Subtopic s1 = subtopic(1L, List.of("mnemonic_cards"));
            Subtopic s2 = subtopic(2L, List.of("mnemonic_cards"));

            List<SubtopicSummaryResponse> result = service.buildSubtopicSummaries(
                    List.of(s1, s2), List.of(), 1L
            );

            assertThat(result).hasSize(2);
            assertThat(result.get(0).status()).isEqualTo(ProgressStatus.UNBLOCKED);
            assertThat(result.get(1).status()).isEqualTo(ProgressStatus.LOCKED);
        }

        @Test
        @DisplayName("should unlock second subtopic when first is fully completed")
        void shouldUnlockNextWhenPreviousCompleted() {
            Subtopic s1 = subtopic(1L, List.of("mnemonic_cards"));
            Subtopic s2 = subtopic(2L, List.of("mnemonic_cards"));

            List<UserSubtopicLevelMechanicProgress> prog = List.of(
                    progress(s1, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED),
                    progress(s1, MechanicType.MATCHING, ProgressStatus.COMPLETED),
                    progress(s1, MechanicType.FILLING_GAPS, ProgressStatus.COMPLETED),
                    progress(s1, MechanicType.WORD_BUILDER, ProgressStatus.COMPLETED)
            );

            List<SubtopicSummaryResponse> result = service.buildSubtopicSummaries(
                    List.of(s1, s2), prog, 1L
            );

            assertThat(result.get(0).status()).isEqualTo(ProgressStatus.COMPLETED);
            assertThat(result.get(1).status()).isEqualTo(ProgressStatus.UNBLOCKED);
        }

        @Test
        @DisplayName("should return IN_PROGRESS when a mechanic is currently in progress")
        void shouldReturnInProgressWhenMechanicActive() {
            Subtopic s1 = subtopic(1L, List.of("mnemonic_cards"));
            List<UserSubtopicLevelMechanicProgress> prog = List.of(
                    progress(s1, MechanicType.FLASHCARDS, ProgressStatus.IN_PROGRESS)
            );

            List<SubtopicSummaryResponse> result = service.buildSubtopicSummaries(
                    List.of(s1), prog, 1L
            );

            assertThat(result.get(0).status()).isEqualTo(ProgressStatus.IN_PROGRESS);
        }

        @Test
        @DisplayName("should return empty list when there are no subtopics")
        void shouldReturnEmptyList() {
            List<SubtopicSummaryResponse> result = service.buildSubtopicSummaries(List.of(), List.of(), 1L);
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should return UNBLOCKED for first subtopic even when it has partial progress")
        void shouldReturnUnblockedWhenPartialProgress() {
            Subtopic s1 = subtopic(1L, List.of("mnemonic_cards"));
            List<UserSubtopicLevelMechanicProgress> prog = List.of(
                    progress(s1, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED)
            );

            List<SubtopicSummaryResponse> result = service.buildSubtopicSummaries(
                    List.of(s1), prog, 1L
            );

            assertThat(result.get(0).status()).isEqualTo(ProgressStatus.UNBLOCKED);
        }
    }
}