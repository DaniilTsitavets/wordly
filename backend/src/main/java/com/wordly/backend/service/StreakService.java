package com.wordly.backend.service;

import com.wordly.backend.entity.User;
import com.wordly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserRepository userRepository;

    /**
     * Records one active day for the user (called from a level completion or a recall). Idempotent
     * within a day: repeated calls on the same day are no-ops and do not write.
     */
    @Transactional
    public void recordActivity(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            if (applyActivity(user, LocalDate.now())) {
                userRepository.save(user);
            }
        });
    }

    /**
     * Pure increment transition, package-private for unit testing. Mutates the user's streak and
     * last-active date; returns {@code true} if anything changed (i.e. a save is needed). Also
     * ratchets the historical {@code longestStreak} — it only ever grows, never resets, so the stats
     * screen can show the user's all-time record even after the current streak breaks.
     */
    static boolean applyActivity(User user, LocalDate today) {
        LocalDate last = user.getLastActiveDate();
        if (today.equals(last)) {
            return false;
        }
        int current = user.getStreak() == null ? 0 : user.getStreak();
        int next = last != null && today.equals(last.plusDays(1)) ? current + 1 : 1;
        user.setStreak(next);
        user.setLastActiveDate(today);
        int longest = user.getLongestStreak() == null ? 0 : user.getLongestStreak();
        if (next > longest) {
            user.setLongestStreak(next);
        }
        return true;
    }

    public int currentStreak(User user) {
        return currentStreak(user, LocalDate.now());
    }

    /**
     * The streak as displayed (grace model), package-private for unit testing: the stored counter
     * is valid only while the last active day is today or yesterday; once a full day is missed it
     * shows 0.
     */
    static int currentStreak(User user, LocalDate today) {
        LocalDate last = user.getLastActiveDate();
        if (last == null || last.isBefore(today.minusDays(1))) {
            return 0;
        }
        return user.getStreak() == null ? 0 : user.getStreak();
    }
}
