package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.TrajetDto;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.TrajetRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class TrajetService {

    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;

    public Trajet createTrajet(TrajetDto dto, String email) {
        User conducteur = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Conducteur non trouvé"));

        Trajet trajet = Trajet.builder()
                .villeDepart(dto.getVilleDepart())
                .villeArrivee(dto.getVilleArrivee())
                .etapes(dto.getEtapes())
                .dateHeureDepart(dto.getDateHeureDepart())
                .placesDisponibles(dto.getPlacesDisponibles())
                .distanceKm(dto.getDistanceKm())
                .dureeEstimee(dto.getDureeEstimee())
                .latitudeDepart(dto.getLatitudeDepart())
                .longitudeDepart(dto.getLongitudeDepart())
                .latitudeArrivee(dto.getLatitudeArrivee())
                .longitudeArrivee(dto.getLongitudeArrivee())
                .conducteur(conducteur)
                .build();

        return trajetRepository.save(trajet);
    }

    public java.util.List<Trajet> getTrajetsByConducteur(String email) {
        User conducteur = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return trajetRepository.findByConducteurId(conducteur.getId());
    }

    public void deleteTrajet(Long id, String email) {
        Trajet trajet = trajetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (!trajet.getConducteur().getEmail().equals(email)) {
            throw new RuntimeException("Vous n'avez pas le droit de supprimer ce trajet");
        }

        LocalDateTime now = LocalDateTime.now();
        long heuresAvantDepart = ChronoUnit.HOURS.between(now, trajet.getDateHeureDepart());

        if (heuresAvantDepart < 24) {
            throw new RuntimeException("Impossible de supprimer le trajet moins de 24 heures avant le départ.");
        }

        trajetRepository.delete(trajet);
    }
}