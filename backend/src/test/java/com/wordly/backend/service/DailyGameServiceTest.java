package com.wordly.backend.service;

import com.wordly.backend.dto.DailyGameResponse;
import com.wordly.backend.entity.DailyGame;
import com.wordly.backend.exception.NotFoundException;
import com.wordly.backend.repository.DailyGameRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DailyGameService")
class DailyGameServiceTest {

    private static final ZoneId CET = ZoneId.of("Europe/Paris");

    @Mock
    private DailyGameRepository dailyGameRepository;

    @InjectMocks
    private DailyGameService dailyGameService;

    private DailyGame game(long id, LocalDate scheduledDate) {
        return DailyGame.builder()
                .id(id)
                .idiom("Break a leg")
                .option1("Сломать ногу")
                .option2("Пожелать удачи")
                .option3("Убежать")
                .option4("Упасть")
                .correctOption(2)
                .scheduledDate(scheduledDate)
                .build();
    }

    private DailyGameService serviceWithClock(Clock clock) {
        return new DailyGameService(dailyGameRepository, clock);
    }

    private Clock clockAt(String isoDateTime) {
        return Clock.fixed(Instant.parse(isoDateTime), CET);
    }

    @Nested
    @DisplayName("getToday")
    class GetToday {

        @Test
        @DisplayName("should return already-assigned game for today")
        void shouldReturnAlreadyAssignedGame() {
            LocalDate today = LocalDate.of(2026, 5, 23);
            DailyGame existing = game(1L, today);
            // 12:00 CET — normal daytime
            DailyGameService svc = serviceWithClock(clockAt("2026-05-23T10:00:00Z"));

            when(dailyGameRepository.findByScheduledDate(today)).thenReturn(Optional.of(existing));

            DailyGameResponse response = svc.getToday();

            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.idiom()).isEqualTo("Break a leg");
            assertThat(response.options()).hasSize(4);
            assertThat(response.correctOption()).isEqualTo(2);
            verify(dailyGameRepository, never()).findRandomUnassignedForUpdate();
        }

        @Test
        @DisplayName("should assign a random unassigned game when none assigned for today")
        void shouldAssignRandomGameWhenNoneForToday() {
            LocalDate today = LocalDate.of(2026, 5, 23);
            DailyGame unassigned = game(2L, null);
            DailyGame saved = game(2L, today);
            DailyGameService svc = serviceWithClock(clockAt("2026-05-23T10:00:00Z"));

            when(dailyGameRepository.findByScheduledDate(today)).thenReturn(Optional.empty());
            when(dailyGameRepository.findRandomUnassignedForUpdate()).thenReturn(Optional.of(unassigned));
            when(dailyGameRepository.save(unassigned)).thenReturn(saved);

            DailyGameResponse response = svc.getToday();

            assertThat(response.id()).isEqualTo(2L);
            assertThat(unassigned.getScheduledDate()).isEqualTo(today);
            verify(dailyGameRepository).save(unassigned);
        }

        @Test
        @DisplayName("should throw NotFoundException when no unassigned games exist")
        void shouldThrowWhenNoGamesAvailable() {
            LocalDate today = LocalDate.of(2026, 5, 23);
            DailyGameService svc = serviceWithClock(clockAt("2026-05-23T10:00:00Z"));

            when(dailyGameRepository.findByScheduledDate(today)).thenReturn(Optional.empty());
            when(dailyGameRepository.findRandomUnassignedForUpdate()).thenReturn(Optional.empty());

            assertThatThrownBy(svc::getToday).isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("should fallback to findByScheduledDate on concurrent assignment conflict")
        void shouldFallbackOnConcurrentConflict() {
            LocalDate today = LocalDate.of(2026, 5, 23);
            DailyGame unassigned = game(3L, null);
            DailyGame winnerGame = game(5L, today);
            DailyGameService svc = serviceWithClock(clockAt("2026-05-23T10:00:00Z"));

            when(dailyGameRepository.findByScheduledDate(today))
                    .thenReturn(Optional.empty())
                    .thenReturn(Optional.of(winnerGame));
            when(dailyGameRepository.findRandomUnassignedForUpdate()).thenReturn(Optional.of(unassigned));
            when(dailyGameRepository.save(unassigned)).thenThrow(new DataIntegrityViolationException("unique"));

            DailyGameResponse response = svc.getToday();

            assertThat(response.id()).isEqualTo(5L);
        }

        @Test
        @DisplayName("should return tomorrow's game after 23:00 CET")
        void shouldReturnTomorrowGameAfter23() {
            // 23:30 CET = 21:30 UTC
            LocalDate tomorrow = LocalDate.of(2026, 5, 24);
            DailyGame tomorrowGame = game(7L, tomorrow);
            DailyGameService svc = serviceWithClock(clockAt("2026-05-23T21:30:00Z"));

            when(dailyGameRepository.findByScheduledDate(tomorrow)).thenReturn(Optional.of(tomorrowGame));

            DailyGameResponse response = svc.getToday();

            assertThat(response.id()).isEqualTo(7L);
        }

        @Test
        @DisplayName("should return today's game before 23:00 CET")
        void shouldReturnTodayGameBefore23() {
            // 22:59 CET = 20:59 UTC
            LocalDate today = LocalDate.of(2026, 5, 23);
            DailyGame todayGame = game(6L, today);
            DailyGameService svc = serviceWithClock(clockAt("2026-05-23T20:59:00Z"));

            when(dailyGameRepository.findByScheduledDate(today)).thenReturn(Optional.of(todayGame));

            DailyGameResponse response = svc.getToday();

            assertThat(response.id()).isEqualTo(6L);
        }
    }

    @Nested
    @DisplayName("DailyGameResponse mapping")
    class ResponseMapping {

        @Test
        @DisplayName("should map all four options into ordered list")
        void shouldMapOptionsToList() {
            DailyGame g = DailyGame.builder()
                    .id(1L).idiom("Hit the sack")
                    .option1("A").option2("B").option3("C").option4("D")
                    .correctOption(3).scheduledDate(LocalDate.now())
                    .build();

            DailyGameResponse r = DailyGameResponse.of(g);

            assertThat(r.options()).containsExactly("A", "B", "C", "D");
            assertThat(r.correctOption()).isEqualTo(3);
        }
    }
}