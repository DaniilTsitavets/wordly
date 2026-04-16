package com.wordly.backend.service;

import com.wordly.backend.dto.LevelProgressResponse;
import com.wordly.backend.dto.SubtopicSummaryResponse;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProgressComputationService {

    private static final List<MechanicType> FIXED_ORDER = List.of(
            MechanicType.MNEMONIC_CARDS,
            MechanicType.FLASHCARDS,
            MechanicType.MATCHING,
            MechanicType.FILLING_GAPS,
            MechanicType.WORD_BUILDER
    );

    public List<SubtopicSummaryResponse> buildSubtopicSummaries(
            List<Subtopic> subtopics,
            List<UserSubtopicLevelMechanicProgress> allUserProgress,
            Long userId
    ) {
        List<SubtopicSummaryResponse> result = new ArrayList<>();

        boolean previousCompleted = true;

        for (int i = 0; i < subtopics.size(); i++) {
            Subtopic subtopic = subtopics.get(i);

            String status = computeSubtopicStatus(subtopic, allUserProgress, previousCompleted);
            result.add(new SubtopicSummaryResponse(
                    subtopic.getId(),
                    subtopic.getName(),
                    subtopic.getDescription(),
                    subtopic.getImageUrl(),
                    subtopic.getSortOrder(),
                    subtopic.getWordsCount(),
                    subtopic.getDisabledMechanics(),
                    status
            ));

            previousCompleted = "completed".equals(status);
        }

        return result;
    }

    public boolean isSubtopicCompleted(
            Subtopic subtopic,
            List<UserSubtopicLevelMechanicProgress> allUserProgress
    ) {
        List<MechanicType> activeMechanics = getActiveMechanics(subtopic);

        Map<MechanicType, UserSubtopicLevelMechanicProgress> progressMap =
                allUserProgress.stream()
                        .filter(p -> p.getSubtopic().getId().equals(subtopic.getId()))
                        .collect(Collectors.toMap(
                                UserSubtopicLevelMechanicProgress::getMechanicType,
                                Function.identity(),
                                (a, b) -> a
                        ));

        return activeMechanics.stream().allMatch(mechanic -> {
            UserSubtopicLevelMechanicProgress progress = progressMap.get(mechanic);
            return progress != null && progress.getStatus() == ProgressStatus.COMPLETED;
        });
    }

    public List<LevelProgressResponse> buildLevelProgress(
            Subtopic subtopic,
            List<UserSubtopicLevelMechanicProgress> subtopicProgress
    ) {
        List<MechanicType> activeMechanics = getActiveMechanics(subtopic);

        Map<MechanicType, UserSubtopicLevelMechanicProgress> progressMap =
                subtopicProgress.stream()
                        .collect(Collectors.toMap(
                                UserSubtopicLevelMechanicProgress::getMechanicType,
                                Function.identity(),
                                (a, b) -> a
                        ));

        List<LevelProgressResponse> result = new ArrayList<>();
        boolean previousCompleted = true;

        for (MechanicType mechanic : activeMechanics) {
            UserSubtopicLevelMechanicProgress progress = progressMap.get(mechanic);

            if (progress != null) {
                result.add(new LevelProgressResponse(
                        mechanic,
                        progress.getStatus(),
                        progress.getStartedAt(),
                        progress.getCompletedAt()
                ));
                previousCompleted = progress.getStatus() == ProgressStatus.COMPLETED;
            } else {
                String inferredStatus = previousCompleted ? "unblocked" : "locked";
                result.add(new LevelProgressResponse(
                        mechanic.getValue(),
                        inferredStatus,
                        null,
                        null
                ));
                previousCompleted = false;
            }
        }

        return result;
    }

    private String computeSubtopicStatus(
            Subtopic subtopic,
            List<UserSubtopicLevelMechanicProgress> allUserProgress,
            boolean previousSubtopicCompleted
    ) {
        List<MechanicType> activeMechanics = getActiveMechanics(subtopic);

        Map<MechanicType, UserSubtopicLevelMechanicProgress> progressMap =
                allUserProgress.stream()
                        .filter(p -> p.getSubtopic().getId().equals(subtopic.getId()))
                        .collect(Collectors.toMap(
                                UserSubtopicLevelMechanicProgress::getMechanicType,
                                Function.identity(),
                                (a, b) -> a
                        ));

        boolean hasInProgress = progressMap.values().stream()
                .anyMatch(p -> p.getStatus() == ProgressStatus.IN_PROGRESS);

        if (hasInProgress) {
            return "in_progress";
        }

        boolean allCompleted = activeMechanics.stream().allMatch(mechanic -> {
            UserSubtopicLevelMechanicProgress p = progressMap.get(mechanic);
            return p != null && p.getStatus() == ProgressStatus.COMPLETED;
        });

        if (allCompleted) {
            return "completed";
        }

        boolean hasAnyProgress = !progressMap.isEmpty();
        if (hasAnyProgress || previousSubtopicCompleted) {
            return "unblocked";
        }

        return "locked";
    }

    public List<MechanicType> getActiveMechanics(Subtopic subtopic) {
        Set<String> disabled = new HashSet<>(subtopic.getDisabledMechanics());

        return FIXED_ORDER.stream()
                .filter(mechanic -> !disabled.contains(mechanic.getValue()))
                .toList();
    }
}