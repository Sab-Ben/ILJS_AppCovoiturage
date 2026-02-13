package com.appcovoiturage.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {
    private Long rideId;         // côté front ça s'appelle rideId
    private Integer seats;
    private String desiredRoute;
}
