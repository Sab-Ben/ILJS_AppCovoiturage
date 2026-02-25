package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.ReservationRequest;
import com.appcovoiturage.backend.dto.ReservationResponse;
import com.appcovoiturage.backend.entity.Reservation;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.ReservationRepository;
import com.appcovoiturage.backend.repository.TrajetRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;

    //on l’utilise pour notifier le conducteur.
    private final NotificationService notificationService;

    /**
     * réservation via body (rideId, seats, desiredRoute) + user connecté.
     */
    @Transactional
    public ReservationResponse createReservation(ReservationRequest req, User user) {
        if (req.getRideId() == null) {
            throw new IllegalArgumentException("rideId est requis");
        }
        if (req.getSeats() == null || req.getSeats() <= 0) {
            throw new IllegalArgumentException("seats invalide");
        }
        if (req.getDesiredRoute() == null || req.getDesiredRoute().trim().isEmpty()) {
            throw new IllegalArgumentException("desiredRoute est requis");
        }

        Trajet trajet = trajetRepository.findById(req.getRideId())
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable"));

        // Empêcher le conducteur de réserver son propre trajet
        if (trajet.getConducteur() != null && trajet.getConducteur().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Le conducteur ne peut pas réserver son propre trajet");
        }

        // Empêcher doublon de réservation (1 réservation par passager / trajet)
        if (reservationRepository.existsByTrajet_IdAndPassager_Id(trajet.getId(), user.getId())) {
            throw new IllegalArgumentException("Vous avez déjà réservé ce trajet");
        }

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

        // Notification conducteur
        if (notificationService != null && trajet.getConducteur() != null) {
            try {
                notificationService.notifyReservationCreated(trajet.getConducteur(), trajet, user);
            } catch (Exception ignored) {
                // On ne casse pas la réservation si la notif échoue
            }
        }

        return ReservationResponse.builder()
                .id(reservation.getId())
                .build();
    }

    /**
     * réservation via trajetId + email
     * On crée une ReservationRequest par défaut.
     */
    @Transactional
    public ReservationResponse createReservation(Long trajetId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        ReservationRequest req = new ReservationRequest();
        req.setRideId(trajetId);
        req.setSeats(1); // par défaut 1 place
        req.setDesiredRoute("Trajet complet");

        return createReservation(req, user);
    }

    @Transactional
    public void cancelReservation(Long reservationId, User user) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));

        if (!reservation.getPassager().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Action non autorisée");
        }

        Trajet trajet = reservation.getTrajet();

        // règle des 2h avant départ
        LocalDateTime depart = trajet.getDateHeureDepart();
        if (depart != null && LocalDateTime.now().isAfter(depart.minusHours(2))) {
            throw new IllegalArgumentException("Impossible d'annuler moins de 2h avant le départ");
        }

        // libère la/les place(s)
        Integer seats = reservation.getSeats() == null ? 1 : reservation.getSeats();
        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() + seats);
        trajetRepository.save(trajet);

        reservationRepository.delete(reservation);
    }

    /**
     * Réservations du passager connecté
     */
    @Transactional(readOnly = true)
    public List<Reservation> getMyReservations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        return reservationRepository.findByPassager_Id(user.getId());
    }

    /**
     * Réservations d’un trajet (uniquement conducteur du trajet).
     */
    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByTrajet(Long trajetId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable"));

        if (trajet.getConducteur() == null || !trajet.getConducteur().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Accès refusé");
        }

        return reservationRepository.findByTrajet_Id(trajetId);
    }
}