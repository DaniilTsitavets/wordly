package com.wordly.backend.entity;

import com.wordly.backend.entity.converter.RoleConverter;
import com.wordly.backend.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String surname;

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "is_guest", nullable = false)
    private boolean guest;

    @Convert(converter = RoleConverter.class)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "interface_language")
    @Builder.Default
    private String interfaceLanguage = "ru";

    @Column(name = "daily_goal_min")
    @Builder.Default
    private Integer dailyGoalMin = 10;

    @Column(name = "notifications_enabled")
    @Builder.Default
    private Boolean notificationsEnabled = true;

    @Column(name = "color_theme")
    @Builder.Default
    private String colorTheme = "system";

    @Column(nullable = false)
    @Builder.Default
    private Integer streak = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer gems = 0;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
