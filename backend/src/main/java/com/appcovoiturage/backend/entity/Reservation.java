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
        name = "reservation",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"trajet_id", "passager_id"})
        }
)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "trajet_id", nullable = false)
    private Trajet trajet;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "passager_id", nullable = false)
    private User passager;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false)
    private String desiredRoute;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}