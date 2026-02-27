package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.ReservationResponseDto;
import com.appcovoiturage.backend.entity.Reservation;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.ReservationRepository;
import com.appcovoiturage.backend.repository.TrajetRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import com.appcovoiturage.backend.dto.WsEventDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appcovoiturage.backend.exception.BadRequestException;
import com.appcovoiturage.backend.exception.ForbiddenException;
import com.appcovoiturage.backend.exception.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PointService pointService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ReservationResponseDto createReservation(Long trajetId, String emailPassager) {
        User passager = userRepository.findByEmail(emailPassager)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new NotFoundException("Trajet non trouvé"));

        if (trajet.getConducteur().getId().equals(passager.getId())) {
            throw new BadRequestException("Le conducteur ne peut pas réserver son propre trajet");
        }

        if (reservationRepository.existsByTrajetIdAndPassagerId(trajetId, passager.getId())) {
            throw new BadRequestException("Vous avez déjà réservé ce trajet");
        }

        if (trajet.getPlacesDisponibles() <= 0) {
            throw new BadRequestException("Plus de places disponibles pour ce trajet");
        }

        long currentReservations = reservationRepository.countByTrajetId(trajetId);
        int totalPassengersAfterBooking = (int) currentReservations + 1;
        int cost = pointService.debitPassengerPoints(trajet, passager, totalPassengersAfterBooking);

        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() - 1);
        trajetRepository.save(trajet);

        Reservation reservation = Reservation.builder()
                .trajet(trajet)
                .passager(passager)
                .seats(1)
                .desiredRoute(trajet.getVilleDepart() + " -> " + trajet.getVilleArrivee())
                .createdAt(LocalDateTime.now())
                .build();

        Reservation saved = reservationRepository.save(reservation);

        String itineraire = trajet.getVilleDepart() + " → " + trajet.getVilleArrivee();

        try {
            notificationService.notifyReservationCreated(trajet.getConducteur(), trajet, passager);
        } catch (Exception e) {
            log.error("Erreur notification conducteur: {}", e.getMessage(), e);
        }

        try {
            notificationService.notifyReservationConfirmed(passager, trajet);
        } catch (Exception e) {
            log.error("Erreur notification confirmation passager: {}", e.getMessage(), e);
        }

        try {
            notificationService.notifyPointsDebited(passager, cost, itineraire, trajet.getId());
        } catch (Exception e) {
            log.error("Erreur notification points debites: {}", e.getMessage(), e);
        }

        try {
            broadcastSeatsUpdate(trajet);
        } catch (Exception e) {
            log.error("Erreur broadcast seats: {}", e.getMessage(), e);
        }

        return toDto(saved);
    }

    public boolean isAlreadyReserved(Long trajetId, String email) {
        User passager = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        return reservationRepository.existsByTrajetIdAndPassagerId(trajetId, passager.getId());
    }

    public ReservationResponseDto getMyReservationForRide(Long trajetId, String email) {
        User passager = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));
        return reservationRepository.findByTrajetIdAndPassagerId(trajetId, passager.getId())
                .map(this::toDto)
                .orElse(null);
    }

    public List<ReservationResponseDto> getMyReservations(String emailPassager) {
        User passager = userRepository.findByEmail(emailPassager)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        return reservationRepository.findByPassagerId(passager.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<ReservationResponseDto> getReservationsByTrajet(Long trajetId, String emailConducteur) {
        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new NotFoundException("Trajet non trouvé"));

        if (!trajet.getConducteur().getEmail().equals(emailConducteur)) {
            throw new ForbiddenException("Accès refusé");
        }

        return reservationRepository.findByTrajetId(trajetId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private ReservationResponseDto toDto(Reservation reservation) {
        Trajet trajet = reservation.getTrajet();
        String driverName = trajet.getConducteur().getFirstname() + " " + trajet.getConducteur().getLastname();

        ReservationResponseDto.RideInfo rideInfo = ReservationResponseDto.RideInfo.builder()
                .id(trajet.getId())
                .from(trajet.getVilleDepart())
                .to(trajet.getVilleArrivee())
                .date(trajet.getDateHeureDepart() != null ? trajet.getDateHeureDepart().toLocalDate().toString() : null)
                .departureTime(trajet.getDateHeureDepart() != null ? trajet.getDateHeureDepart().toLocalTime().toString() : null)
                .availableSeats(trajet.getPlacesDisponibles())
                .driverName(driverName)
                .build();

        return ReservationResponseDto.builder()
                .id(reservation.getId())
                .trajetId(trajet.getId())
                .passagerId(reservation.getPassager().getId())
                .passagerEmail(reservation.getPassager().getEmail())
                .passagerName(reservation.getPassager().getFirstname() + " " + reservation.getPassager().getLastname())
                .seats(reservation.getSeats())
                .createdAt(reservation.getCreatedAt())
                .ride(rideInfo)
                .build();
    }

    @Transactional
    public void cancelReservationByEmail(Long reservationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("Réservation introuvable"));

        if (!reservation.getPassager().getId().equals(user.getId())) {
            throw new ForbiddenException("Action non autorisée");
        }

        Trajet trajet = reservation.getTrajet();

        LocalDateTime depart = trajet.getDateHeureDepart();
        if (depart != null && LocalDateTime.now().isAfter(depart.minusHours(2))) {
            throw new BadRequestException("Impossible d'annuler moins de 2h avant le départ");
        }

        pointService.refundPassengerPoints(reservation);

        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() + reservation.getSeats());
        trajetRepository.save(trajet);

        reservationRepository.delete(reservation);

        try {
            notificationService.notifyReservationCancelled(user, trajet);
        } catch (Exception ignored) {
        }

        try {
            broadcastSeatsUpdate(trajet);
        } catch (Exception ignored) {
        }
    }

    private void broadcastSeatsUpdate(Trajet trajet) {
        messagingTemplate.convertAndSend(
                "/topic/rides/" + trajet.getId(),
                WsEventDto.<java.util.Map<String, Object>>builder()
                        .type("SEATS_UPDATED")
                        .payload(java.util.Map.of(
                                "trajetId", trajet.getId(),
                                "availableSeats", trajet.getPlacesDisponibles()
                        ))
                        .build()
        );
    }
}
