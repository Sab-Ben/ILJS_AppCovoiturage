package com.appcovoiturage.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {
    private Long rideId;
    private Integer seats;
    private String desiredRoute;
}