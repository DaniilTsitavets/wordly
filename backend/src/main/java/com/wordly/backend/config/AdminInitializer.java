package com.wordly.backend.config;

import com.wordly.backend.entity.User;
import com.wordly.backend.entity.enums.Role;
import com.wordly.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
public class AdminInitializer {

    @Bean
    public ApplicationRunner seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.email:admin@wordly.local}") String email,
            @Value("${admin.password:admin12345}") String password,
            @Value("${admin.name:Admin}") String name,
            @Value("${admin.surname:User}") String surname
    ) {
        return args -> {
            String normalizedEmail = email.trim().toLowerCase();

            userRepository.findByEmail(normalizedEmail).ifPresentOrElse(
                    existing -> {
                        if (existing.getRole() != Role.ADMIN) {
                            existing.setRole(Role.ADMIN);
                            userRepository.save(existing);
                            log.info("Promoted existing user to ADMIN: {}", normalizedEmail);
                        }
                    },
                    () -> {
                        User admin = User.builder()
                                .name(name)
                                .surname(surname)
                                .email(normalizedEmail)
                                .passwordHash(passwordEncoder.encode(password))
                                .guest(false)
                                .role(Role.ADMIN)
                                .build();
  try {
      userRepository.save(admin);
  } catch (DataIntegrityViolationException e) {
      log.info("Admin user already exists (concurrent init), skipping.");
  }
                        log.info("Seeded admin user: {}", normalizedEmail);
                    }
            );
        };
    }
}
