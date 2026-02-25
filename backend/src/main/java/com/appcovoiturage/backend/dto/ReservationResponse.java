package com.appcovoiturage.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private Integer seats;
    private String status;
    private String desiredRoute;
    private LocalDateTime createdAt;
    private RideSummary ride;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RideSummary {
        private Long id;
        private String from;
        private String to;
        private String date;
        private String departureTime;
        private Integer availableSeats;
        private Double price;
        private String driverName;
    }
}