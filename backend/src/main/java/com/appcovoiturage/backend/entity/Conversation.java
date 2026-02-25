package com.appcovoiturage.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "conversation",
        uniqueConstraints = @UniqueConstraint(columnNames = {"trajet_id", "user1_id", "user2_id"})
)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Conversation liée à un trajet (selon le besoin)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trajet_id")
    private Trajet trajet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}