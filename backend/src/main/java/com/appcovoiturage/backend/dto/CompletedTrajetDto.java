package com.appcovoiturage.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletedTrajetDto {
    private Long id;              // pour distinguer les courses (id)
    private String date;          // ex: 2026-02-12
    private String heure;         // ex: 14:30
    private String itineraire;    // ex: Paris → Orléans → Tours → Nantes
    private Integer pointsGagnes; // points gagnés sur CETTE course
}
