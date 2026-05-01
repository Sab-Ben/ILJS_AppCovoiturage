package com.appcovoiturage.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrajetDto {
    private String villeDepart;
    private String villeArrivee;
    private List<String> etapes;
    private LocalDateTime dateHeureDepart;
    private Integer placesDisponibles;
    private Double distanceKm;
    private String dureeEstimee;
    private Double latitudeDepart;
    private Double longitudeDepart;
    private Double latitudeArrivee;
    private Double longitudeArrivee;
}