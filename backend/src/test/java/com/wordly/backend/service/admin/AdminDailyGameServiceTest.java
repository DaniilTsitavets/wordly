package com.wordly.backend.service.admin;

import com.wordly.backend.dto.admin.AdminDailyGameRequest;
import com.wordly.backend.dto.admin.AdminDailyGameResponse;
import com.wordly.backend.entity.DailyGame;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.DailyGameRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminDailyGameService")
class AdminDailyGameServiceTest {

    @Mock
    private DailyGameRepository dailyGameRepository;

    @InjectMocks
    private AdminDailyGameService adminDailyGameService;

    private DailyGame game(long id) {
        return DailyGame.builder()
                .id(id).idiom("Break a leg")
                .option1("A").option2("B").option3("C").option4("D")
                .correctOption(1).scheduledDate(null)
                .build();
    }

    private AdminDailyGameRequest request() {
        return new AdminDailyGameRequest("Break a leg", "A", "B", "C", "D", 1);
    }

    @Nested
    @DisplayName("list")
    class List_ {

        @Test
        @DisplayName("should return all games")
        void shouldReturnAll() {
            when(dailyGameRepository.findAll()).thenReturn(List.of(game(1L), game(2L)));

            List<AdminDailyGameResponse> result = adminDailyGameService.list();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).id()).isEqualTo(1L);
            assertThat(result.get(1).id()).isEqualTo(2L);
        }

        @Test
        @DisplayName("should return empty list when no games exist")
        void shouldReturnEmptyList() {
            when(dailyGameRepository.findAll()).thenReturn(List.of());

            assertThat(adminDailyGameService.list()).isEmpty();
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("should save and return new game")
        void shouldSaveAndReturn() {
            DailyGame saved = game(10L);
            when(dailyGameRepository.save(any())).thenReturn(saved);

            AdminDailyGameResponse response = adminDailyGameService.create(request());

            assertThat(response.id()).isEqualTo(10L);
            assertThat(response.scheduledDate()).isNull();
        }

        @Test
        @DisplayName("should trim whitespace from idiom and options")
        void shouldTrimFields() {
            AdminDailyGameRequest req = new AdminDailyGameRequest("  Break a leg  ", "  A  ", "B", "C", "D", 2);
            ArgumentCaptor<DailyGame> captor = ArgumentCaptor.forClass(DailyGame.class);
            when(dailyGameRepository.save(captor.capture())).thenReturn(game(1L));

            adminDailyGameService.create(req);

            DailyGame captured = captor.getValue();
            assertThat(captured.getIdiom()).isEqualTo("Break a leg");
            assertThat(captured.getOption1()).isEqualTo("A");
        }

        @Test
        @DisplayName("should save with null scheduled_date")
        void shouldSaveWithNullDate() {
            ArgumentCaptor<DailyGame> captor = ArgumentCaptor.forClass(DailyGame.class);
            when(dailyGameRepository.save(captor.capture())).thenReturn(game(1L));

            adminDailyGameService.create(request());

            assertThat(captor.getValue().getScheduledDate()).isNull();
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("should update fields and return updated game")
        void shouldUpdateFields() {
            DailyGame existing = game(5L);
            existing.setScheduledDate(LocalDate.of(2026, 5, 20));
            when(dailyGameRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(dailyGameRepository.save(existing)).thenReturn(existing);

            AdminDailyGameRequest req = new AdminDailyGameRequest("Hit the sack", "X", "Y", "Z", "W", 3);
            AdminDailyGameResponse response = adminDailyGameService.update(5L, req);

            assertThat(response.idiom()).isEqualTo("Hit the sack");
            assertThat(response.correctOption()).isEqualTo(3);
            assertThat(response.scheduledDate()).isEqualTo(LocalDate.of(2026, 5, 20));
        }

        @Test
        @DisplayName("should throw NotFoundException when game does not exist")
        void shouldThrowWhenNotFound() {
            when(dailyGameRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> adminDailyGameService.update(99L, request()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        @DisplayName("should delete game by id")
        void shouldDelete() {
            DailyGame existing = game(3L);
            when(dailyGameRepository.findById(3L)).thenReturn(Optional.of(existing));

            adminDailyGameService.delete(3L);

            verify(dailyGameRepository).delete(existing);
        }

        @Test
        @DisplayName("should throw NotFoundException when game does not exist")
        void shouldThrowWhenNotFound() {
            when(dailyGameRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> adminDailyGameService.delete(99L))
                    .isInstanceOf(NotFoundException.class);
            verify(dailyGameRepository, never()).delete(any());
        }
    }
}