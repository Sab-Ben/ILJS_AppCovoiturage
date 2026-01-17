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
@Table(name = "trajet")
public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String villeDepart;

    @Column(nullable = false)
    private String villeArrivee;

    @Column(nullable = false)
    private LocalDateTime dateHeureDepart;

    @Column(nullable = false)
    private Integer placesDisponibles;

    @ManyToOne
    @JoinColumn(name = "conducteur_id", nullable = false)
    private User conducteur;

}