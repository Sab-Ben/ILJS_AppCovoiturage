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
    private String passagerName;
    private Integer seats;
    private LocalDateTime createdAt;
    private RideInfo ride;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RideInfo {
        private Long id;
        private String from;
        private String to;
        private String date;
        private String departureTime;
        private Integer availableSeats;
        private String driverName;
    }
}
