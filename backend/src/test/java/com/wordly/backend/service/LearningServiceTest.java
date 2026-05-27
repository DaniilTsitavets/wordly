package com.wordly.backend.service;

import com.wordly.backend.dto.AnswerRequest;
import com.wordly.backend.dto.AnswerResultResponse;
import com.wordly.backend.dto.CompleteSessionRequest;
import com.wordly.backend.dto.LevelCompleteResultResponse;
import com.wordly.backend.dto.SessionDataResponse;
import com.wordly.backend.entity.Subtopic;
import com.wordly.backend.entity.Topic;
import com.wordly.backend.entity.User;
import com.wordly.backend.entity.UserSubtopicLevelMechanicProgress;
import com.wordly.backend.entity.UserTopicBonusAward;
import com.wordly.backend.entity.UserWordState;
import com.wordly.backend.entity.Word;
import com.wordly.backend.entity.enums.MechanicType;
import com.wordly.backend.entity.enums.ProgressStatus;
import com.wordly.backend.entity.enums.WordStatus;
import com.wordly.backend.exception.LevelLockedException;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.SubtopicRepository;
import com.wordly.backend.repository.UserTopicBonusAwardRepository;
import com.wordly.backend.repository.UserRepository;
import com.wordly.backend.repository.UserSubtopicLevelMechanicProgressRepository;
import com.wordly.backend.repository.UserWordStateRepository;
import com.wordly.backend.repository.WordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("LearningService")
class LearningServiceTest {

    @Mock
    private SubtopicService subtopicService;
    @Mock
    private WordRepository wordRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserSubtopicLevelMechanicProgressRepository progressRepository;
    @Mock
    private UserWordStateRepository userWordStateRepository;
    @Mock
    private ProgressComputationService progressComputationService;
    @Mock
    private SubtopicRepository subtopicRepository;
    @Mock
    private UserTopicBonusAwardRepository topicBonusAwardRepository;

    @InjectMocks
    private LearningService learningService;

    private Topic topic(long id) {
        return Topic.builder().id(id).name("Topic " + id).description("").imageUrl("").sortOrder(0).build();
    }

    private Subtopic subtopic(long id) {
        return Subtopic.builder()
                .id(id)
                .topic(topic(1L))
                .name("Subtopic " + id)
                .description("")
                .imageUrl("")
                .sortOrder(0)
                .wordsCount(5)
                .build();
    }

    private Word word(long id, String wordEn) {
        return Word.builder()
                .id(id)
                .wordEn(wordEn)
                .translationRu("перевод")
                .transcriptionEn("trænskrɪpʃən")
                .imageUrl("")
                .usageExampleEn("")
                .usageExampleEnTranslationRu("")
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
    @DisplayName("getSession")
    class GetSession {

        @Test
        @DisplayName("should create an IN_PROGRESS record and return session for the first mechanic when there is no prior progress")
        void shouldCreateProgressAndReturnSessionForFirstMechanic() {
            Subtopic s = subtopic(10L);
            List<Word> words = List.of(word(1L, "plate"), word(2L, "fork"));

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicId(1L, 10L)).thenReturn(List.of());
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(words);

            SessionDataResponse response = learningService.getSession(10L, 1L, false);

            assertThat(response.subtopicId()).isEqualTo(10L);
            assertThat(response.mechanicType()).isEqualTo(MechanicType.FLASHCARDS);
            assertThat(response.words()).hasSize(2);
            verify(progressRepository).save(argThat(p ->
                    p.getMechanicType() == MechanicType.FLASHCARDS && p.getStatus() == ProgressStatus.IN_PROGRESS
            ));
        }

        @Test
        @DisplayName("should resume the currently IN_PROGRESS mechanic without creating a new record")
        void shouldResumeInProgressMechanic() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress inProgress = progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS);

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicId(1L, 10L)).thenReturn(List.of(inProgress));
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(List.of());

            SessionDataResponse response = learningService.getSession(10L, 1L, false);

            assertThat(response.mechanicType()).isEqualTo(MechanicType.MATCHING);
            verify(progressRepository, never()).save(any());
        }

        @Test
        @DisplayName("should return the next unlocked mechanic when the previous one is completed")
        void shouldReturnNextUnlockedMechanic() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress completed = progress(s, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED);

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicId(1L, 10L)).thenReturn(List.of(completed));
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(List.of());

            SessionDataResponse response = learningService.getSession(10L, 1L, false);

            assertThat(response.mechanicType()).isEqualTo(MechanicType.MATCHING);
        }

        @Test
        @DisplayName("should include mnemonic data only for MNEMONIC_CARDS mechanic and when word has mnemonic")
        void shouldIncludeMnemonicOnlyForMnemonicCardsMechanic() {
            Subtopic s = subtopic(10L);
            Word wordWithMnemonic = Word.builder()
                    .id(1L)
                    .wordEn("plate")
                    .translationRu("тарелка")
                    .transcriptionEn("pleɪt")
                    .imageUrl("")
                    .usageExampleEn("")
                    .usageExampleEnTranslationRu("")
                    .mnemonicImageUrl("https://img.example.com/plate.jpg")
                    .mnemoText("A plate is flat")
                    .build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.MNEMONIC_CARDS));
            when(progressRepository.findByUserIdAndSubtopicId(1L, 10L)).thenReturn(List.of());
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(List.of(wordWithMnemonic));

            SessionDataResponse response = learningService.getSession(10L, 1L, false);

            assertThat(response.words().get(0).mnemonic()).isNotNull();
            assertThat(response.words().get(0).mnemonic().imageUrl()).isEqualTo("https://img.example.com/plate.jpg");
            assertThat(response.words().get(0).mnemonic().mnemoText()).isEqualTo("A plate is flat");
        }

        @Test
        @DisplayName("should not include mnemonic data for non-MNEMONIC_CARDS mechanic even if word has mnemonic")
        void shouldNotIncludeMnemonicForNonMnemonicMechanic() {
            Subtopic s = subtopic(10L);
            Word wordWithMnemonic = Word.builder()
                    .id(1L)
                    .wordEn("plate")
                    .translationRu("тарелка")
                    .transcriptionEn("pleɪt")
                    .imageUrl("")
                    .usageExampleEn("")
                    .usageExampleEnTranslationRu("")
                    .mnemonicImageUrl("https://img.example.com/plate.jpg")
                    .mnemoText("A plate is flat")
                    .build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s)).thenReturn(List.of(MechanicType.FLASHCARDS));
            when(progressRepository.findByUserIdAndSubtopicId(1L, 10L)).thenReturn(List.of());
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(List.of(wordWithMnemonic));

            SessionDataResponse response = learningService.getSession(10L, 1L, false);

            assertThat(response.words().get(0).mnemonic()).isNull();
        }

        @Test
        @DisplayName("should throw LevelLockedException when all mechanics are completed")
        void shouldThrowWhenAllMechanicsCompleted() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress done1 = progress(s, MechanicType.FLASHCARDS, ProgressStatus.COMPLETED);
            UserSubtopicLevelMechanicProgress done2 = progress(s, MechanicType.MATCHING, ProgressStatus.COMPLETED);

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicId(1L, 10L)).thenReturn(List.of(done1, done2));

            assertThatThrownBy(() -> learningService.getSession(10L, 1L, false))
                    .isInstanceOf(LevelLockedException.class);
        }
    }

    @Nested
    @DisplayName("submitAnswer")
    class SubmitAnswer {

        @Test
        @DisplayName("should return isCorrect=true when answer matches the word (case-insensitive, trimmed)")
        void shouldReturnCorrectForMatchingAnswer() {
            Word w = word(1L, "Plate");
            when(wordRepository.findById(1L)).thenReturn(Optional.of(w));
            when(userWordStateRepository.findByUserIdAndWordId(1L, 1L)).thenReturn(Optional.empty());

            AnswerRequest request = new AnswerRequest(1L, MechanicType.FLASHCARDS, "  plate  ");
            AnswerResultResponse result = learningService.submitAnswer(10L, request, 1L);

            assertThat(result.isCorrect()).isTrue();
            assertThat(result.correctAnswer()).isEqualTo("Plate");
        }

        @Test
        @DisplayName("should return isCorrect=false when answer does not match")
        void shouldReturnIncorrectForWrongAnswer() {
            Word w = word(1L, "plate");
            when(wordRepository.findById(1L)).thenReturn(Optional.of(w));
            when(userWordStateRepository.findByUserIdAndWordId(1L, 1L)).thenReturn(Optional.empty());

            AnswerRequest request = new AnswerRequest(1L, MechanicType.FLASHCARDS, "fork");
            AnswerResultResponse result = learningService.submitAnswer(10L, request, 1L);

            assertThat(result.isCorrect()).isFalse();
            assertThat(result.correctAnswer()).isEqualTo("plate");
        }

        @Test
        @DisplayName("should create a LEARNING UserWordState when one does not yet exist")
        void shouldCreateWordStateWhenAbsent() {
            Word w = word(1L, "plate");
            when(wordRepository.findById(1L)).thenReturn(Optional.of(w));
            when(userWordStateRepository.findByUserIdAndWordId(1L, 1L)).thenReturn(Optional.empty());

            learningService.submitAnswer(10L, new AnswerRequest(1L, MechanicType.FLASHCARDS, "plate"), 1L);

            verify(userWordStateRepository).save(argThat(state ->
                    state.getUserId() == 1L && state.getStatus() == WordStatus.LEARNING
            ));
        }

        @Test
        @DisplayName("should not create a new UserWordState when one already exists")
        void shouldNotCreateWordStateWhenAlreadyExists() {
            Word w = word(1L, "plate");
            UserWordState existing = UserWordState.builder()
                    .userId(1L).word(w).status(WordStatus.LEARNING).build();
            when(wordRepository.findById(1L)).thenReturn(Optional.of(w));
            when(userWordStateRepository.findByUserIdAndWordId(1L, 1L)).thenReturn(Optional.of(existing));

            learningService.submitAnswer(10L, new AnswerRequest(1L, MechanicType.FLASHCARDS, "plate"), 1L);

            verify(userWordStateRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw NotFoundException when the word does not exist")
        void shouldThrowWhenWordNotFound() {
            when(wordRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> learningService.submitAnswer(10L,
                    new AnswerRequest(99L, MechanicType.FLASHCARDS, "plate"), 1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("completeLevel")
    class CompleteLevel {

        @Test
        @DisplayName("should mark level COMPLETED, award gems, and return next mechanic for a non-last level")
        void shouldCompleteLevelAndReturnNextMechanic() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress matchingProgress = progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS);
            User user = User.builder().id(1L).gems(20).build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING, MechanicType.FILLING_GAPS));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.of(matchingProgress));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.FILLING_GAPS))
                    .thenReturn(Optional.empty());
            when(progressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            LevelCompleteResultResponse result = learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            );

            assertThat(result.mechanicType()).isEqualTo(MechanicType.MATCHING);
            assertThat(result.gemsEarned()).isEqualTo(5);
            assertThat(result.nextMechanic()).isEqualTo(MechanicType.FILLING_GAPS);
            assertThat(result.subtopicCompleted()).isFalse();
            assertThat(matchingProgress.getStatus()).isEqualTo(ProgressStatus.COMPLETED);
            assertThat(user.getGems()).isEqualTo(25);
        }

        @Test
        @DisplayName("should set subtopicCompleted=true and nextMechanic=null when completing the last mechanic")
        void shouldReturnSubtopicCompletedWhenLastMechanicDone() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress lastProgress = progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS);
            User user = User.builder().id(1L).gems(0).build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.of(lastProgress));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            LevelCompleteResultResponse result = learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            );

            assertThat(result.subtopicCompleted()).isTrue();
            assertThat(result.nextMechanic()).isNull();
        }

        @Test
        @DisplayName("should award +15 topic bonus on top of +5 when the last subtopic of the topic is completed")
        void shouldAwardTopicBonusWhenTopicCompleted() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress lastProgress = progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS);
            User user = User.builder().id(1L).gems(0).build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.of(lastProgress));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(subtopicRepository.findAllByTopicIdOrderBySortOrderAscIdAsc(1L)).thenReturn(List.of(s));
            when(progressComputationService.isSubtopicCompleted(eq(s), anyList())).thenReturn(true);
            when(topicBonusAwardRepository.existsByUserIdAndTopicId(1L, 1L)).thenReturn(false);

            LevelCompleteResultResponse result = learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            );

            assertThat(result.subtopicCompleted()).isTrue();
            assertThat(result.gemsEarned()).isEqualTo(20);
            assertThat(user.getGems()).isEqualTo(20);
            verify(topicBonusAwardRepository).save(any(UserTopicBonusAward.class));
        }

        @Test
        @DisplayName("should not re-award the topic bonus when it was already granted for the topic")
        void shouldNotReAwardTopicBonusWhenAlreadyGranted() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress lastProgress = progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS);
            User user = User.builder().id(1L).gems(0).build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.of(lastProgress));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(subtopicRepository.findAllByTopicIdOrderBySortOrderAscIdAsc(1L)).thenReturn(List.of(s));
            when(progressComputationService.isSubtopicCompleted(eq(s), anyList())).thenReturn(true);
            when(topicBonusAwardRepository.existsByUserIdAndTopicId(1L, 1L)).thenReturn(true);

            LevelCompleteResultResponse result = learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            );

            assertThat(result.subtopicCompleted()).isTrue();
            assertThat(result.gemsEarned()).isEqualTo(5);
            assertThat(user.getGems()).isEqualTo(5);
            verify(topicBonusAwardRepository, never()).save(any());
        }

        @Test
        @DisplayName("should not award the topic bonus when other subtopics of the topic are still incomplete")
        void shouldNotAwardTopicBonusWhenTopicIncomplete() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress lastProgress = progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS);
            User user = User.builder().id(1L).gems(0).build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.of(lastProgress));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(subtopicRepository.findAllByTopicIdOrderBySortOrderAscIdAsc(1L)).thenReturn(List.of(s, subtopic(11L)));
            when(progressComputationService.isSubtopicCompleted(any(), anyList())).thenReturn(false);

            LevelCompleteResultResponse result = learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            );

            assertThat(result.subtopicCompleted()).isTrue();
            assertThat(result.gemsEarned()).isEqualTo(5);
            assertThat(user.getGems()).isEqualTo(5);
        }

        @Test
        @DisplayName("should return idempotent result when the level is already completed")
        void shouldReturnIdempotentResultWhenAlreadyCompleted() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress alreadyDone = progress(s, MechanicType.MATCHING, ProgressStatus.COMPLETED);

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.of(alreadyDone));

            LevelCompleteResultResponse result = learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            );

            assertThat(result.mechanicType()).isEqualTo(MechanicType.MATCHING);
            assertThat(result.gemsEarned()).isEqualTo(0);
            assertThat(result.subtopicCompleted()).isTrue();
        }

        @Test
        @DisplayName("should throw LevelLockedException when mechanic is not in the active list")
        void shouldThrowWhenMechanicNotInActiveList() {
            Subtopic s = subtopic(10L);

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            )).isInstanceOf(LevelLockedException.class);
        }

        @Test
        @DisplayName("should throw LevelLockedException when predecessor mechanic is not yet completed")
        void shouldThrowWhenPredecessorNotCompleted() {
            Subtopic s = subtopic(10L);

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.empty());
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.FLASHCARDS))
                    .thenReturn(Optional.of(progress(s, MechanicType.FLASHCARDS, ProgressStatus.IN_PROGRESS)));

            assertThatThrownBy(() -> learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            )).isInstanceOf(LevelLockedException.class);
        }

        @Test
        @DisplayName("should set NEW words to LEARNING when completing FLASHCARDS")
        void shouldSetNewWordsToLearningOnFlashcardsCompletion() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress flashcardsProgress = progress(s, MechanicType.FLASHCARDS, ProgressStatus.IN_PROGRESS);
            User user = User.builder().id(1L).gems(0).build();
            Word w = word(1L, "plate");
            UserWordState state = UserWordState.builder()
                    .userId(1L).word(w).status(WordStatus.NEW).build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.FLASHCARDS))
                    .thenReturn(Optional.of(flashcardsProgress));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(List.of(w));
            when(userWordStateRepository.findByUserIdAndWordId(1L, 1L)).thenReturn(Optional.of(state));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.empty());
            when(progressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            learningService.completeLevel(10L, new CompleteSessionRequest(MechanicType.FLASHCARDS), 1L, false);

            assertThat(state.getStatus()).isEqualTo(WordStatus.LEARNING);
        }

        @Test
        @DisplayName("should set all words to RECALLING with interval=1 when completing WORD_BUILDER")
        void shouldSetWordsToRecallingOnWordBuilderCompletion() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress wordBuilderProgress = progress(s, MechanicType.WORD_BUILDER, ProgressStatus.IN_PROGRESS);
            User user = User.builder().id(1L).gems(0).build();
            Word w = word(1L, "plate");
            UserWordState state = UserWordState.builder()
                    .userId(1L).word(w).status(WordStatus.LEARNING).build();

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.WORD_BUILDER));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.WORD_BUILDER))
                    .thenReturn(Optional.of(wordBuilderProgress));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(wordRepository.findBySubtopicIdOrderByIdAsc(10L)).thenReturn(List.of(w));
            when(userWordStateRepository.findByUserIdAndWordId(1L, 1L)).thenReturn(Optional.of(state));

            learningService.completeLevel(10L, new CompleteSessionRequest(MechanicType.WORD_BUILDER), 1L, false);

            assertThat(state.getStatus()).isEqualTo(WordStatus.RECALLING);
            assertThat(state.getRecallInterval()).isEqualTo(1);
            assertThat(state.getNextRecall()).isEqualTo(LocalDate.now().plusDays(1));
        }

        @Test
        @DisplayName("should throw NotFoundException when user is not found while awarding gems")
        void shouldThrowWhenUserNotFoundDuringCompletion() {
            Subtopic s = subtopic(10L);
            UserSubtopicLevelMechanicProgress matchingProgress = progress(s, MechanicType.MATCHING, ProgressStatus.IN_PROGRESS);

            when(subtopicService.getAccessibleSubtopic(10L, false)).thenReturn(s);
            when(progressComputationService.getActiveMechanics(s))
                    .thenReturn(List.of(MechanicType.FLASHCARDS, MechanicType.MATCHING));
            when(progressRepository.findByUserIdAndSubtopicIdAndMechanicType(1L, 10L, MechanicType.MATCHING))
                    .thenReturn(Optional.of(matchingProgress));
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> learningService.completeLevel(
                    10L, new CompleteSessionRequest(MechanicType.MATCHING), 1L, false
            )).isInstanceOf(NotFoundException.class);
        }
    }
}