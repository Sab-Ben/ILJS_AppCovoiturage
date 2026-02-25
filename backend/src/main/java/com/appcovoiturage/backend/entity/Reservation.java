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
@Table(name = "reservation")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "trajet_id")
    private Trajet trajet;

    @ManyToOne(optional = false)
    @JoinColumn(name = "passager_id")
    private User passager;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false)
    private String desiredRoute;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
