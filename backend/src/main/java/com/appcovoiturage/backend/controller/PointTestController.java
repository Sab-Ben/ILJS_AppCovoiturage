package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.PointBalanceDto;
import com.appcovoiturage.backend.entity.Reservation;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.ReservationRepository;
import com.appcovoiturage.backend.repository.TrajetRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import com.appcovoiturage.backend.service.PointService;
import com.appcovoiturage.backend.service.TrajetCompletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/points")
@RequiredArgsConstructor
@Profile("test")
public class PointTestController {

    private final PointService pointService;
    private final TrajetCompletionService trajetCompletionService;
    private final TrajetRepository trajetRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    @PostMapping("/trigger-completion")
    public ResponseEntity<Map<String, String>> triggerCompletion() {
        trajetCompletionService.processCompletedTrajets();
        return ResponseEntity.ok(Map.of("status", "Traitement termine"));
    }

    @GetMapping("/debug-trajets")
    public ResponseEntity<List<Map<String, Object>>> debugTrajets() {
        List<Trajet> tous = trajetRepository.findByPointsCreditesFalse();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Trajet t : tous) {
            Map<String, Object> info = new HashMap<>();
            info.put("id", t.getId());
            info.put("villeDepart", t.getVilleDepart());
            info.put("villeArrivee", t.getVilleArrivee());
            info.put("dateHeureDepart", t.getDateHeureDepart());
            info.put("dureeEstimee", t.getDureeEstimee());
            info.put("distanceKm", t.getDistanceKm());
            info.put("pointsCredites", t.getPointsCredites());
            info.put("conducteurEmail", t.getConducteur().getEmail());
            info.put("nbReservations", reservationRepository.countByTrajetId(t.getId()));
            info.put("now", LocalDateTime.now());
            result.add(info);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/test-completion")
    @Transactional
    public ResponseEntity<Map<String, Object>> testCompletion(Authentication authentication) {
        User conducteur = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        PointBalanceDto balanceAvant = pointService.getBalance(conducteur.getEmail());

        Trajet trajetTest = Trajet.builder()
                .villeDepart("Casablanca")
                .villeArrivee("Rabat")
                .dateHeureDepart(LocalDateTime.now().minusHours(3))
                .placesDisponibles(3)
                .distanceKm(90.0)
                .dureeEstimee("1h30")
                .latitudeDepart(33.5731)
                .longitudeDepart(-7.5898)
                .latitudeArrivee(34.0209)
                .longitudeArrivee(-6.8416)
                .pointsCredites(false)
                .conducteur(conducteur)
                .build();
        trajetRepository.save(trajetTest);

        Reservation reservationTest = Reservation.builder()
                .trajet(trajetTest)
                .passager(conducteur)
                .seats(1)
                .desiredRoute("Casablanca -> Rabat")
                .createdAt(LocalDateTime.now().minusHours(4))
                .build();
        reservationRepository.save(reservationTest);

        int points = pointService.creditDriverPoints(trajetTest, conducteur);
        trajetTest.setPointsCredites(true);
        trajetRepository.save(trajetTest);

        PointBalanceDto balanceApres = pointService.getBalance(conducteur.getEmail());

        return ResponseEntity.ok(Map.of(
                "message", "Test termine",
                "pointsAvant", balanceAvant.getCurrentBalance(),
                "pointsApres", balanceApres.getCurrentBalance(),
                "pointsGagnes", points,
                "trajetId", trajetTest.getId()
        ));
    }
}
