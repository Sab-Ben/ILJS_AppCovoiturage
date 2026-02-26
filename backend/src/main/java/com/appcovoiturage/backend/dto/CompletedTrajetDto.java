package com.appcovoiturage.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletedTrajetDto {
    private Long id;
    private String date;
    private String heure;
    private String itineraire;
    private Integer pointsGagnes;
}
