package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.repository.TrajetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrajetCompletionProcessor {

    private final TrajetRepository trajetRepository;
    private final PointService pointService;
    private final NotificationService notificationService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean processTrajet(Trajet trajet) {
        int points = pointService.creditDriverPoints(trajet, trajet.getConducteur());
        trajet.setPointsCredites(true);
        trajetRepository.save(trajet);

        log.info("Credite {} points au conducteur {} pour trajet {} ({} -> {})",
                points,
                trajet.getConducteur().getEmail(),
                trajet.getId(),
                trajet.getVilleDepart(),
                trajet.getVilleArrivee());

        if (points > 0) {
            try {
                String itineraire = trajet.getVilleDepart() + " \u2192 " + trajet.getVilleArrivee();
                notificationService.notifyPointsCredited(
                        trajet.getConducteur(), points, itineraire, trajet.getId());
            } catch (Exception e) {
                log.error("Erreur notification points credites trajet {}: {}", trajet.getId(), e.getMessage());
            }
        }

        return true;
    }
}
