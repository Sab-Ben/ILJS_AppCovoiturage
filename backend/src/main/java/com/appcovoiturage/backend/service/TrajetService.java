package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.TrajetDto;
import com.appcovoiturage.backend.entity.Reservation;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.ReservationRepository;
import com.appcovoiturage.backend.repository.TrajetRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;


import com.appcovoiturage.backend.dto.CompletedTrajetDto;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class TrajetService {

    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;

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

        // ✅ Récupérer les passagers réservés avant suppression
        List<User> passagers = reservationRepository.findByTrajetId(id)
                .stream()
                .map(Reservation::getPassager)
                .distinct()
                .toList();

        // ✅ Notifier (in-app + email) les passagers si besoin
        if (!passagers.isEmpty()) {
            notificationService.notifyTrajetDeleted(passagers, trajet);
        }

        trajetRepository.delete(trajet);
    }

    public List<Trajet> searchTrajets(String from, String to, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        return trajetRepository.searchUpcoming(from, to, start, end, LocalDateTime.now());
    }


    public List<CompletedTrajetDto> getCompletedTrajets(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        LocalDateTime now = LocalDateTime.now();

        List<Trajet> completed = trajetRepository
                .findByConducteurIdAndDateHeureDepartBeforeOrderByDateHeureDepartDesc(user.getId(), now);

        return completed.stream().map(t -> {
            String itineraire = buildItineraire(t);

            // ✅ règle simple, stable et "exacte" : 1 point/km arrondi
            int points = (int) Math.round(t.getDistanceKm() != null ? t.getDistanceKm() : 0.0);

            return CompletedTrajetDto.builder()
                    .id(t.getId())
                    .date(t.getDateHeureDepart().toLocalDate().toString())
                    .heure(t.getDateHeureDepart().toLocalTime().withSecond(0).withNano(0).toString())
                    .itineraire(itineraire)
                    .pointsGagnes(points)
                    .build();
        }).collect(Collectors.toList());
    }

    private String buildItineraire(Trajet t) {
        StringBuilder sb = new StringBuilder();
        sb.append(t.getVilleDepart());

        if (t.getEtapes() != null && !t.getEtapes().isEmpty()) {
            for (String e : t.getEtapes()) {
                if (e != null && !e.trim().isEmpty()) {
                    sb.append(" → ").append(e.trim());
                }
            }
        }

        sb.append(" → ").append(t.getVilleArrivee());
        return sb.toString();
    }

    public Trajet getTrajetById(Long id) {
        return trajetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));
    }


}