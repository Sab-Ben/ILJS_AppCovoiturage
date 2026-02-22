package com.appcovoiturage.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDto {
    private Long id;
    private Long trajetId;
    private Long passagerId;
    private String passagerEmail;
    private LocalDateTime createdAt;
}
