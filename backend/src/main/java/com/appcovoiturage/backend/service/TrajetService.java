package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.TrajetDto;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.TrajetRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
                .dateHeureDepart(dto.getDateHeureDepart())
                .placesDisponibles(dto.getPlacesDisponibles())
                .conducteur(conducteur)
                .build();

        return trajetRepository.save(trajet);
    }

}