package com.appcovoiturage.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrajetDto {
    private String villeDepart;
    private String villeArrivee;
    private LocalDateTime dateHeureDepart;
    private Integer placesDisponibles;
    private Double distanceKm;
    private String dureeEstimee;
}