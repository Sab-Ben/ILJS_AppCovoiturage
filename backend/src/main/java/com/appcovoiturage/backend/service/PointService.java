package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.PointBalanceDto;
import com.appcovoiturage.backend.dto.PointTransactionDto;
import com.appcovoiturage.backend.entity.*;
import com.appcovoiturage.backend.exception.BadRequestException;
import com.appcovoiturage.backend.exception.InsufficientPointsException;
import com.appcovoiturage.backend.exception.NotFoundException;
import com.appcovoiturage.backend.repository.PointTransactionRepository;
import com.appcovoiturage.backend.repository.ReservationRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class PointService {

    private static final double POINTS_PER_KM = 0.3;
    private static final double LONG_TRIP_BONUS_PERCENT = 0.15;
    private static final double PASSENGER_BONUS_PERCENT = 0.05;
    private static final double MAX_PASSENGER_BONUS_PERCENT = 0.20;
    private static final double MIN_DISTANCE_KM = 5.0;
    private static final int SIGNUP_BONUS = 30;
    private static final long LONG_TRIP_MINUTES = 120;
    private static final double EXPERT_DISCOUNT = 0.15;
    private static final double AMBASSADEUR_GAIN_BONUS = 0.25;

    @Value("${app.points.daily-cap:150}")
    private int dailyGainCap;

    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;

    public PointService(PointTransactionRepository pointTransactionRepository,
                        UserRepository userRepository,
                        ReservationRepository reservationRepository,
                        NotificationService notificationService) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void creditSignupBonus(User user) {
        createTransaction(user, PointTransactionType.BONUS_INSCRIPTION, SIGNUP_BONUS,
                "Bonus d'inscription", null);
    }

    @Transactional
    public int creditDriverPoints(Trajet trajet, User conducteur) {
        if (trajet.getDistanceKm() == null) {
            log.info("Trajet id={}: distanceKm est null, 0 points", trajet.getId());
            return 0;
        }

        long passengerCount = reservationRepository.countByTrajetId(trajet.getId());
        if (passengerCount == 0) {
            log.info("Trajet id={}: aucun passager, 0 points", trajet.getId());
            return 0;
        }

        if (pointTransactionRepository.existsByUserIdAndTrajetIdAndType(
                conducteur.getId(), trajet.getId(), PointTransactionType.GAIN_CONDUCTEUR)) {
            log.info("Trajet id={}: deja credite, 0 points", trajet.getId());
            return 0;
        }

        int points = calculateDriverPoints(trajet, (int) passengerCount, conducteur);
        int pointsAvantCap = points;
        points = applyDailyCap(conducteur, points);
        log.info("Trajet id={}: distance={}km, passagers={}, pointsCalcules={}, apresPlafond={}",
                trajet.getId(), trajet.getDistanceKm(), passengerCount, pointsAvantCap, points);

        if (points <= 0) {
            return 0;
        }

        String itineraire = trajet.getVilleDepart() + " → " + trajet.getVilleArrivee();
        createTransaction(conducteur, PointTransactionType.GAIN_CONDUCTEUR, points,
                "Trajet " + itineraire + " (" + passengerCount + " passager(s))", trajet.getId());

        checkAndApplyLevelUp(conducteur);

        return points;
    }

    public int debitPassengerPoints(Trajet trajet, User passager, int totalPassengers) {
        int cost = calculatePassengerCost(trajet, totalPassengers, passager);

        int balance = passager.getPointBalance() != null ? passager.getPointBalance() : 0;
        if (balance < cost) {
            throw new InsufficientPointsException(
                    "Solde insuffisant. Requis: " + cost + ", disponible: " + balance);
        }

        String itineraire = trajet.getVilleDepart() + " → " + trajet.getVilleArrivee();
        createTransaction(passager, PointTransactionType.DEPENSE_PASSAGER, -cost,
                "Réservation trajet " + itineraire, trajet.getId());

        return cost;
    }

    public void refundPassengerPoints(Reservation reservation) {
        List<PointTransaction> transactions = pointTransactionRepository
                .findByUserIdOrderByCreatedAtDesc(reservation.getPassager().getId());

        int refundAmount = transactions.stream()
                .filter(t -> t.getTrajetId() != null
                        && t.getTrajetId().equals(reservation.getTrajet().getId())
                        && t.getType() == PointTransactionType.DEPENSE_PASSAGER)
                .mapToInt(t -> Math.abs(t.getAmount()))
                .findFirst()
                .orElse(0);

        if (refundAmount > 0) {
            String itineraire = reservation.getTrajet().getVilleDepart() + " → "
                    + reservation.getTrajet().getVilleArrivee();
            createTransaction(reservation.getPassager(), PointTransactionType.REMBOURSEMENT_ANNULATION,
                    refundAmount, "Remboursement annulation " + itineraire,
                    reservation.getTrajet().getId());
        }
    }

    public PointBalanceDto getBalance(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        int totalEarned = pointTransactionRepository.sumPositiveAmountsByUserId(user.getId());
        UserLevel currentLevel = UserLevel.fromTotalPoints(totalEarned);
        UserLevel nextLevel = currentLevel.nextLevel();

        double progressPercent = 0.0;
        if (nextLevel != null) {
            int range = nextLevel.getThreshold() - currentLevel.getThreshold();
            int progress = totalEarned - currentLevel.getThreshold();
            progressPercent = range > 0 ? Math.min(((double) progress / range) * 100, 100.0) : 100.0;
        } else {
            progressPercent = 100.0;
        }

        return PointBalanceDto.builder()
                .currentBalance(user.getPointBalance() != null ? user.getPointBalance() : 0)
                .totalEarned(totalEarned)
                .level(currentLevel.name())
                .levelLabel(currentLevel.getLabel())
                .levelRank(currentLevel.getRank())
                .nextLevel(nextLevel != null ? nextLevel.name() : null)
                .nextLevelLabel(nextLevel != null ? nextLevel.getLabel() : null)
                .pointsToNextLevel(currentLevel.pointsToNextLevel(totalEarned))
                .nextLevelThreshold(nextLevel != null ? nextLevel.getThreshold() : null)
                .currentLevelThreshold(currentLevel.getThreshold())
                .levelProgressPercent(Math.round(progressPercent * 10.0) / 10.0)
                .levelAvantages(currentLevel.getAvantages())
                .build();
    }

    public List<PointTransactionDto> getTransactionHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        return pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public int getRequiredPointsForTrip(Trajet trajet, User passager) {
        long currentPassengers = reservationRepository.countByTrajetId(trajet.getId());
        return calculatePassengerCost(trajet, (int) currentPassengers + 1, passager);
    }

    private int calculateDriverPoints(Trajet trajet, int passengerCount, User conducteur) {
        double basePoints = trajet.getDistanceKm() * POINTS_PER_KM;

        double bonusMultiplier = 1.0;

        if (isLongTrip(trajet)) {
            bonusMultiplier += LONG_TRIP_BONUS_PERCENT;
        }

        double passengerBonus = Math.min(
                passengerCount * PASSENGER_BONUS_PERCENT,
                MAX_PASSENGER_BONUS_PERCENT);
        bonusMultiplier += passengerBonus;

        int totalEarned = pointTransactionRepository.sumPositiveAmountsByUserId(conducteur.getId());
        UserLevel level = UserLevel.fromTotalPoints(totalEarned);
        if (level == UserLevel.AMBASSADEUR) {
            bonusMultiplier += AMBASSADEUR_GAIN_BONUS;
        }

        return Math.max(1, (int) Math.round(basePoints * bonusMultiplier));
    }

    private int calculatePassengerCost(Trajet trajet, int totalPassengers, User passager) {
        if (trajet.getDistanceKm() == null) {
            throw new BadRequestException("Distance du trajet non définie");
        }

        double baseCost = trajet.getDistanceKm() * POINTS_PER_KM;
        int effectivePassengers = Math.max(totalPassengers, 1);
        double costPerPassenger = baseCost / effectivePassengers;

        int totalEarned = pointTransactionRepository.sumPositiveAmountsByUserId(passager.getId());
        UserLevel level = UserLevel.fromTotalPoints(totalEarned);
        if (level == UserLevel.EXPERT || level == UserLevel.AMBASSADEUR) {
            costPerPassenger *= (1 - EXPERT_DISCOUNT);
        }

        return Math.max(1, (int) Math.round(costPerPassenger));
    }

    private boolean isLongTrip(Trajet trajet) {
        if (trajet.getDureeEstimee() == null) return false;
        try {
            String duree = trajet.getDureeEstimee().replaceAll("[^0-9hHmM]", "");
            int totalMinutes = 0;
            if (duree.toLowerCase().contains("h")) {
                String[] parts = duree.toLowerCase().split("h");
                totalMinutes = Integer.parseInt(parts[0].trim()) * 60;
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    totalMinutes += Integer.parseInt(parts[1].replaceAll("[^0-9]", "").trim());
                }
            } else {
                totalMinutes = Integer.parseInt(duree.replaceAll("[^0-9]", ""));
            }
            return totalMinutes >= LONG_TRIP_MINUTES;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private int applyDailyCap(User user, int points) {
        int dailyGains = pointTransactionRepository.sumDailyGainsByUserIdAndType(
                user.getId(), PointTransactionType.GAIN_CONDUCTEUR, LocalDate.now());
        int remaining = dailyGainCap - dailyGains;
        return Math.min(points, Math.max(remaining, 0));
    }

    private void createTransaction(User user, PointTransactionType type, int amount,
                                   String description, Long trajetId) {
        PointTransaction transaction = PointTransaction.builder()
                .user(user)
                .type(type)
                .amount(amount)
                .description(description)
                .createdAt(LocalDateTime.now())
                .trajetId(trajetId)
                .build();

        pointTransactionRepository.save(transaction);

        int currentBalance = user.getPointBalance() != null ? user.getPointBalance() : 0;
        int currentTotalEarned = user.getTotalPointsEarned() != null ? user.getTotalPointsEarned() : 0;
        user.setPointBalance(currentBalance + amount);
        user.setTotalPointsEarned(currentTotalEarned + Math.max(0, amount));
        userRepository.save(user);
    }

    private void checkAndApplyLevelUp(User conducteur) {
        int totalEarned = conducteur.getTotalPointsEarned() != null ? conducteur.getTotalPointsEarned() : 0;
        UserLevel previousLevel = UserLevel.fromTotalPoints(totalEarned - 1);
        UserLevel newLevel = UserLevel.fromTotalPoints(totalEarned);

        if (newLevel.getRank() > previousLevel.getRank()) {
            createTransaction(conducteur, PointTransactionType.BONUS_NIVEAU, 10,
                    "Bonus passage au niveau " + newLevel.getLabel(), null);
            try {
                notificationService.notifyLevelUp(
                        conducteur, newLevel.getLabel(), newLevel.getAvantages());
            } catch (Exception e) {
                log.error("Erreur notification level up pour {}: {}", conducteur.getEmail(), e.getMessage());
            }
        }
    }

    private PointTransactionDto toDto(PointTransaction transaction) {
        return PointTransactionDto.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .trajetId(transaction.getTrajetId())
                .build();
    }
}
