package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.ReservationRequest;
import com.appcovoiturage.backend.dto.ReservationResponse;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.dto.ReservationResponseDto;
import com.appcovoiturage.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // Réserver un trajet (passager connecté)
    @PostMapping("/trajets/{trajetId}/reservations")
    public ResponseEntity<ReservationResponseDto> reserveTrajet(
            @PathVariable Long trajetId,
            Principal principal
    ) {
        return ResponseEntity.ok(
                reservationService.createReservation(trajetId, principal.getName())
        );
    }

    // Voir mes réservations (passager)
    @GetMapping("/reservations/me")
    public ResponseEntity<List<ReservationResponseDto>> getMyReservations(Principal principal) {
        return ResponseEntity.ok(
                reservationService.getMyReservations(principal.getName())
        );
    }

    @GetMapping("/trajets/{trajetId}/is-reserved")
    public ResponseEntity<Boolean> isAlreadyReserved(
            @PathVariable Long trajetId,
            Principal principal
    ) {
        return ResponseEntity.ok(
                reservationService.isAlreadyReserved(trajetId, principal.getName())
        );
    }

    @GetMapping("/trajets/{trajetId}/my-reservation")
    public ResponseEntity<ReservationResponseDto> getMyReservationForRide(
            @PathVariable Long trajetId,
            Principal principal
    ) {
        ReservationResponseDto dto = reservationService.getMyReservationForRide(trajetId, principal.getName());
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    // Voir les réservations d'un trajet (conducteur du trajet uniquement)
    @GetMapping("/trajets/{trajetId}/reservations")
    public ResponseEntity<List<ReservationResponseDto>> getReservationsByTrajet(
            @PathVariable Long trajetId,
            Principal principal
    ) {
        return ResponseEntity.ok(
                reservationService.getReservationsByTrajet(trajetId, principal.getName())
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Long id,
            Principal principal
    ) {
        reservationService.cancelReservationByEmail(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}