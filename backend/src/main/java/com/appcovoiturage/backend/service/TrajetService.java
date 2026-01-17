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

        trajetRepository.delete(trajet);
    }
}