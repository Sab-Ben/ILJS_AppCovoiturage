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


//    @PostMapping
//    public ResponseEntity<ReservationResponse> create(@RequestBody ReservationRequest req,
//                                                      @AuthenticationPrincipal User user) {
//        return ResponseEntity.ok(reservationService.createReservation(req, user));
//    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> cancel(@PathVariable Long id,
//                                       @AuthenticationPrincipal User user) {
//        reservationService.cancelReservation(id, user);
//        return ResponseEntity.noContent().build(); // 204
//    }
}