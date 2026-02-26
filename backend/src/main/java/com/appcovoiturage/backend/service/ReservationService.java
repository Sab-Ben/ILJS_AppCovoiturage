package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.ReservationResponseDto;
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
    private final NotificationService notificationService;

    public ReservationResponseDto createReservation(Long trajetId, String emailPassager) {
        User passager = userRepository.findByEmail(emailPassager)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        // Empêcher le conducteur de réserver son propre trajet
        if (trajet.getConducteur().getId().equals(passager.getId())) {
            throw new RuntimeException("Le conducteur ne peut pas réserver son propre trajet");
        }

        // Empêcher doublon
        if (reservationRepository.existsByTrajetIdAndPassagerId(trajetId, passager.getId())) {
            throw new RuntimeException("Vous avez déjà réservé ce trajet");
        }

        // Vérifier places
        long nbReservations = reservationRepository.countByTrajetId(trajetId);
        if (nbReservations >= trajet.getPlacesDisponibles()) {
            throw new RuntimeException("Plus de places disponibles pour ce trajet");
        }

        Reservation reservation = Reservation.builder()
                .trajet(trajet)
                .passager(passager)
                .createdAt(LocalDateTime.now())
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // ✅ Notification + email au conducteur
        notificationService.notifyReservationCreated(trajet.getConducteur(), trajet, passager);

        return toDto(saved);
    }

    public List<ReservationResponseDto> getMyReservations(String emailPassager) {
        User passager = userRepository.findByEmail(emailPassager)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return reservationRepository.findByPassagerId(passager.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<ReservationResponseDto> getReservationsByTrajet(Long trajetId, String emailConducteur) {
        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        // Seul le conducteur du trajet peut voir la liste des réservations
        if (!trajet.getConducteur().getEmail().equals(emailConducteur)) {
            throw new RuntimeException("Accès refusé");
        }

        return reservationRepository.findByTrajetId(trajetId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private ReservationResponseDto toDto(Reservation reservation) {
        return ReservationResponseDto.builder()
                .id(reservation.getId())
                .trajetId(reservation.getTrajet().getId())
                .passagerId(reservation.getPassager().getId())
                .passagerEmail(reservation.getPassager().getEmail())
                .createdAt(reservation.getCreatedAt())
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

}