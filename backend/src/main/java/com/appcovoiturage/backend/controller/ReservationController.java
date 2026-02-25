package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.ReservationResponse;
import com.appcovoiturage.backend.entity.Reservation;
import com.appcovoiturage.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // Réserver un trajet (passager connecté)
    @PostMapping("/trajets/{trajetId}/reservations")
    public ResponseEntity<ReservationResponse> reserveTrajet(
            @PathVariable Long trajetId,
            Principal principal
    ) {
        return ResponseEntity.ok(
                reservationService.createReservation(trajetId, principal.getName())
        );
    }

    // Voir mes réservations (passager)
    @GetMapping("/reservations/me")
    public ResponseEntity<List<Reservation>> getMyReservations(Principal principal) {
        return ResponseEntity.ok(
                reservationService.getMyReservations(principal.getName())
        );
    }

    // Voir les réservations d'un trajet (conducteur uniquement)
    @GetMapping("/trajets/{trajetId}/reservations")
    public ResponseEntity<List<Reservation>> getReservationsByTrajet(
            @PathVariable Long trajetId,
            Principal principal
    ) {
        return ResponseEntity.ok(
                reservationService.getReservationsByTrajet(trajetId, principal.getName())
        );
    }
}