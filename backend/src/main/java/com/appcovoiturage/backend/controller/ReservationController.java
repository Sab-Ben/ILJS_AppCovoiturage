package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.ReservationRequest;
import com.appcovoiturage.backend.dto.ReservationResponse;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponse> create(@RequestBody ReservationRequest req,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reservationService.createReservation(req, user));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(
            @RequestParam(defaultValue = "RESERVED") String status,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reservationService.getMyReservations(user, status));
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(reservationService.getReservationsByRide(rideId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id,
                                       @AuthenticationPrincipal User user) {
        reservationService.cancelReservation(id, user);
        return ResponseEntity.noContent().build();
    }
}