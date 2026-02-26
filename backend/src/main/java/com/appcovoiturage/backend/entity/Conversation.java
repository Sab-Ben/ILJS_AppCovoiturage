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
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"trajet_id", "passager_id"})
        }
)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Trajet concerné
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "trajet_id", nullable = false)
    private Trajet trajet;

    // Conducteur du trajet
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "conducteur_id", nullable = false)
    private User conducteur;

    // Passager intéressé
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "passager_id", nullable = false)
    private User passager;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}