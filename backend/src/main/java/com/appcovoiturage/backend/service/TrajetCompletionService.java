package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.repository.ReservationRepository;
import com.appcovoiturage.backend.repository.TrajetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrajetCompletionService {

    private final TrajetRepository trajetRepository;
    private final ReservationRepository reservationRepository;
    private final TrajetCompletionProcessor completionProcessor;

    @Scheduled(fixedRateString = "${app.scheduler.completion-rate:900000}")
    public void processCompletedTrajets() {
        List<Trajet> trajetsNonCredites = trajetRepository.findByPointsCreditesFalse();

        int traites = 0;
        int credites = 0;
        int erreurs = 0;

        for (Trajet trajet : trajetsNonCredites) {
            try {
                boolean termine = isTrajetTermine(trajet);
                boolean passengers = hasPassengers(trajet);

                log.info("Trajet id={}: termine={}, passagers={}, depart={}, duree={}",
                        trajet.getId(), termine, passengers,
                        trajet.getDateHeureDepart(), trajet.getDureeEstimee());

                if (termine && passengers) {
                    completionProcessor.processTrajet(trajet);
                    credites++;
                }
                traites++;
            } catch (Exception e) {
                erreurs++;
                log.error("Echec credit points trajet id={}: {}", trajet.getId(), e.getMessage(), e);
            }
        }

        if (traites > 0) {
            log.info("Trajet completion: {} traites, {} credites, {} erreurs", traites, credites, erreurs);
        }
    }

    private boolean isTrajetTermine(Trajet trajet) {
        LocalDateTime heureArrivee = calculerHeureArrivee(trajet);
        return heureArrivee != null && LocalDateTime.now().isAfter(heureArrivee);
    }

    private boolean hasPassengers(Trajet trajet) {
        return reservationRepository.countByTrajetId(trajet.getId()) > 0;
    }

    private LocalDateTime calculerHeureArrivee(Trajet trajet) {
        if (trajet.getDateHeureDepart() == null || trajet.getDureeEstimee() == null) {
            return null;
        }
        long minutes = parseDureeEnMinutes(trajet.getDureeEstimee());
        if (minutes <= 0) {
            return null;
        }
        return trajet.getDateHeureDepart().plusMinutes(minutes);
    }

    private long parseDureeEnMinutes(String dureeEstimee) {
        try {
            String duree = dureeEstimee.replaceAll("[^0-9hHmM]", "").toLowerCase();
            int totalMinutes = 0;
            if (duree.contains("h")) {
                String[] parts = duree.split("h");
                totalMinutes = Integer.parseInt(parts[0].trim()) * 60;
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    totalMinutes += Integer.parseInt(parts[1].replaceAll("[^0-9]", "").trim());
                }
            } else {
                totalMinutes = Integer.parseInt(duree.replaceAll("[^0-9]", ""));
            }
            return totalMinutes;
        } catch (NumberFormatException e) {
            log.warn("Format duree invalide: '{}'", dureeEstimee);
            return 0;
        }
    }
}
