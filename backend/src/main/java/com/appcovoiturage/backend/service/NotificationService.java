package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.NotificationResponseDto;
import com.appcovoiturage.backend.dto.WsEventDto;
import com.appcovoiturage.backend.entity.Notification;
import com.appcovoiturage.backend.entity.NotificationType;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.exception.NotFoundException;
import com.appcovoiturage.backend.repository.NotificationRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final EmailService emailService;

    public NotificationResponseDto createAndDispatch(
            User recipient,
            NotificationType type,
            String title,
            String content,
            String referenceType,
            Long referenceId
    ) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponseDto dto = toDto(saved);

        simpMessagingTemplate.convertAndSend(
                "/topic/users/" + recipient.getId() + "/notifications",
                WsEventDto.<NotificationResponseDto>builder()
                        .type("NOTIFICATION_CREATED")
                        .payload(dto)
                        .build()
        );

        return dto;
    }

    // -------- Hooks métier --------

    public void notifyMessageReceived(User recipient, Long conversationId, String trajetLabel) {
        createAndDispatch(
                recipient,
                NotificationType.MESSAGE_RECEIVED,
                "Nouveau message",
                "Nouveau message pour le trajet " + trajetLabel,
                "CONVERSATION",
                conversationId
        );
    }

    public void notifyReservationCreated(User conducteur, Trajet trajet, User passager) {
        String trajetLabel = trajet.getVilleDepart() + " → " + trajet.getVilleArrivee();

        createAndDispatch(
                conducteur,
                NotificationType.RESERVATION_CREATED,
                "Nouvelle réservation",
                "Nouvelle réservation de " + passager.getEmail() + " pour le trajet " + trajetLabel,
                "TRAJET",
                trajet.getId()
        );

        try {
            emailService.sendReservationCreatedEmail(conducteur.getEmail(), trajetLabel, passager.getEmail());
        } catch (Exception e) {
            log.warn("Email réservation non envoyé à {}", conducteur.getEmail(), e);
        }
    }

    public void notifyReservationConfirmed(User passager, Trajet trajet) {
        String trajetLabel = trajet.getVilleDepart() + " → " + trajet.getVilleArrivee();
        String conducteurName = trajet.getConducteur().getFirstname() + " " + trajet.getConducteur().getLastname();

        createAndDispatch(
                passager,
                NotificationType.RESERVATION_CONFIRMED,
                "Réservation confirmée",
                "Votre réservation pour " + trajetLabel + " (conducteur : " + conducteurName + ") est confirmée",
                "TRAJET",
                trajet.getId()
        );
    }

    public void notifyReservationCancelled(User passager, Trajet trajet) {
        String trajetLabel = trajet.getVilleDepart() + " → " + trajet.getVilleArrivee();

        createAndDispatch(
                passager,
                NotificationType.RESERVATION_CANCELLED,
                "Réservation annulée",
                "Votre réservation pour " + trajetLabel + " a été annulée. Vos points ont été remboursés",
                "TRAJET",
                trajet.getId()
        );
    }

    public void notifyPointsDebited(User passager, int points, String itineraire, Long trajetId) {
        createAndDispatch(
                passager,
                NotificationType.POINTS_DEBITED,
                "-" + points + " points",
                points + " points débités pour la réservation du trajet " + itineraire,
                "TRAJET",
                trajetId
        );
    }

    public void notifyTrajetDeleted(List<User> passagers, Trajet trajet) {
        String trajetLabel = trajet.getVilleDepart() + " → " + trajet.getVilleArrivee();

        for (User passager : passagers) {
            createAndDispatch(
                    passager,
                    NotificationType.TRAJET_DELETED,
                    "Trajet supprimé",
                    "Le trajet " + trajetLabel + " a été supprimé par le conducteur",
                    "TRAJET",
                    trajet.getId()
            );

            try {
                emailService.sendTrajetDeletedEmail(passager.getEmail(), trajetLabel);
            } catch (Exception e) {
                log.warn("Email suppression trajet non envoyé à {}", passager.getEmail(), e);
            }
        }
    }

    public void notifyPointsCredited(User conducteur, int points, String itineraire, Long trajetId) {
        createAndDispatch(
                conducteur,
                NotificationType.POINTS_CREDITED,
                "+" + points + " points !",
                "Vous avez gagné " + points + " points pour le trajet " + itineraire,
                "TRAJET",
                trajetId
        );
    }

    public void notifyLevelUp(User user, String levelLabel, String avantages) {
        createAndDispatch(
                user,
                NotificationType.LEVEL_UP,
                "Niveau " + levelLabel + " débloqué !",
                "Félicitations ! Vous êtes maintenant " + levelLabel + ". " + avantages,
                "LEVEL",
                null
        );
    }

    // -------- utilisateur --------

    public List<NotificationResponseDto> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public NotificationResponseDto markAsRead(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        Notification notif = notificationRepository.findByIdAndRecipientId(notificationId, user.getId())
                .orElseThrow(() -> new NotFoundException("Notification non trouvée"));

        notif.setIsRead(true);
        Notification saved = notificationRepository.save(notif);
        return toDto(saved);
    }

    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        List<Notification> notifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        for (Notification n : notifs) {
            if (!Boolean.TRUE.equals(n.getIsRead())) {
                n.setIsRead(true);
            }
        }
        notificationRepository.saveAll(notifs);
    }

    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    private NotificationResponseDto toDto(Notification n) {
        return NotificationResponseDto.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .content(n.getContent())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .referenceType(n.getReferenceType())
                .referenceId(n.getReferenceId())
                .build();
    }
}