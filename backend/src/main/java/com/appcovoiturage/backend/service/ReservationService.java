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
import java.util.List;
import java.util.stream.Collectors;

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

        // On renvoie juste l'id et les infos de base pour valider la création
        return ReservationResponse.builder()
                .id(reservation.getId())
                .seats(reservation.getSeats())
                .desiredRoute(reservation.getDesiredRoute())
                .createdAt(reservation.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(User user, String status) {
        List<Reservation> reservations = reservationRepository.findByPassager(user);
        LocalDateTime now = LocalDateTime.now();

        return reservations.stream()
                .filter(res -> {
                    boolean isPast = res.getTrajet().getDateHeureDepart().isBefore(now);
                    if ("COMPLETED".equalsIgnoreCase(status)) return isPast;
                    if ("RESERVED".equalsIgnoreCase(status)) return !isPast;
                    return true;
                })
                .map(res -> {
                    Trajet trajet = res.getTrajet();
                    boolean isPast = trajet.getDateHeureDepart().isBefore(now);

                    // Conversion des infos du trajet pour le Front
                    ReservationResponse.RideSummary rideSummary = ReservationResponse.RideSummary.builder()
                            .id(trajet.getId())
                            .from(trajet.getVilleDepart())
                            .to(trajet.getVilleArrivee())
                            .date(trajet.getDateHeureDepart().toLocalDate().toString())
                            .departureTime(trajet.getDateHeureDepart().toLocalTime().toString())
                            .availableSeats(trajet.getPlacesDisponibles())
                            .driverName(trajet.getConducteur().getFirstname() + " " + trajet.getConducteur().getLastname())
                            .build();

                    return ReservationResponse.builder()
                            .id(res.getId())
                            .seats(res.getSeats())
                            .desiredRoute(res.getDesiredRoute())
                            .status(isPast ? "COMPLETED" : "RESERVED")
                            .createdAt(res.getCreatedAt())
                            .ride(rideSummary)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelReservation(Long reservationId, User user) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));

        if (!reservation.getPassager().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Action non autorisée");
        }

        Trajet trajet = reservation.getTrajet();

        LocalDateTime depart = trajet.getDateHeureDepart();
        if (LocalDateTime.now().isAfter(depart.minusHours(2))) {
            throw new IllegalArgumentException("Impossible d'annuler moins de 2h avant le départ");
        }

        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() + reservation.getSeats());
        trajetRepository.save(trajet);

        reservationRepository.delete(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByRide(Long rideId) {
        List<Reservation> reservations = reservationRepository.findByTrajetId(rideId);

        System.out.println("Backend - Trajet ID: " + rideId + " | Réservations trouvées: " + reservations.size());

        return reservations.stream()
                .map(res -> ReservationResponse.builder()
                        .id(res.getId())
                        .seats(res.getSeats())
                        .passengerName(res.getPassager().getFirstname() + " " + res.getPassager().getLastname())
                        .desiredRoute(res.getDesiredRoute())
                        .build())
                .collect(Collectors.toList());
    }
}