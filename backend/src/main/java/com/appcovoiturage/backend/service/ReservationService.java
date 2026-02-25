package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.ReservationRequest;
import com.appcovoiturage.backend.dto.ReservationResponse;
import com.appcovoiturage.backend.entity.Reservation;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.ReservationRepository;
import com.appcovoiturage.backend.repository.TrajetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TrajetRepository trajetRepository;

    @Transactional
    public ReservationResponse createReservation(ReservationRequest req, User user) {
        if (req.getRideId() == null) throw new IllegalArgumentException("rideId est requis");
        if (req.getSeats() == null || req.getSeats() <= 0) throw new IllegalArgumentException("seats invalide");
        if (req.getDesiredRoute() == null || req.getDesiredRoute().trim().isEmpty()) {
            throw new IllegalArgumentException("desiredRoute est requis");
        }

        Trajet trajet = trajetRepository.findById(req.getRideId())
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable"));

        if (trajet.getPlacesDisponibles() < req.getSeats()) {
            throw new IllegalArgumentException("Pas assez de places disponibles");
        }

        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() - req.getSeats());
        trajetRepository.save(trajet);

        Reservation reservation = Reservation.builder()
                .trajet(trajet)
                .passager(user)
                .seats(req.getSeats())
                .desiredRoute(req.getDesiredRoute().trim())
                .createdAt(LocalDateTime.now())
                .build();

        reservation = reservationRepository.save(reservation);

        return ReservationResponse.builder()
                .id(reservation.getId())
                .build();
    }

    @Transactional
    public void cancelReservation(Long reservationId, User user) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));

        if (!reservation.getPassager().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Action non autorisée");
        }

        Trajet trajet = reservation.getTrajet();

        // ✅ règle des 2h avant départ
        LocalDateTime depart = trajet.getDateHeureDepart();
        if (LocalDateTime.now().isAfter(depart.minusHours(2))) {
            throw new IllegalArgumentException("Impossible d'annuler moins de 2h avant le départ");
        }

        // ✅ libère la/les place(s)
        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() + reservation.getSeats());
        trajetRepository.save(trajet);

        reservationRepository.delete(reservation);
    }
}
