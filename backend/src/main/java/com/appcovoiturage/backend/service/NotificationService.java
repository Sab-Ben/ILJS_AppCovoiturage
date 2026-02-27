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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationPersistenceService persistenceService;
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
        log.info("createAndDispatch type={} recipient={} title={}", type, recipient.getEmail(), title);

        NotificationResponseDto dto = persistenceService.saveNotification(
                recipient.getId(), type, title, content, referenceType, referenceId);

        try {
            simpMessagingTemplate.convertAndSend(
                    "/topic/users/" + recipient.getId() + "/notifications",
                    WsEventDto.<NotificationResponseDto>builder()
                            .type("NOTIFICATION_CREATED")
                            .payload(dto)
                            .build()
            );
        } catch (Exception e) {
            log.warn("Erreur envoi WebSocket notification: {}", e.getMessage());
        }

        return dto;
    }

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
        String trajetLabel = trajet.getVilleDepart() + " \u2192 " + trajet.getVilleArrivee();

        createAndDispatch(
                conducteur,
                NotificationType.RESERVATION_CREATED,
                "Nouvelle r\u00e9servation",
                "Nouvelle r\u00e9servation de " + passager.getEmail() + " pour le trajet " + trajetLabel,
                "TRAJET",
                trajet.getId()
        );

        sendEmailSafely(() ->
                emailService.sendReservationCreatedEmail(conducteur.getEmail(), trajetLabel, passager.getEmail()));
    }

    public void notifyReservationConfirmed(User passager, Trajet trajet) {
        String trajetLabel = trajet.getVilleDepart() + " \u2192 " + trajet.getVilleArrivee();
        String conducteurName = buildConducteurName(trajet);

        createAndDispatch(
                passager,
                NotificationType.RESERVATION_CONFIRMED,
                "R\u00e9servation confirm\u00e9e",
                "Votre r\u00e9servation pour " + trajetLabel + " (conducteur : " + conducteurName + ") est confirm\u00e9e",
                "TRAJET",
                trajet.getId()
        );
    }

    public void notifyReservationCancelled(User passager, Trajet trajet) {
        String trajetLabel = trajet.getVilleDepart() + " \u2192 " + trajet.getVilleArrivee();

        createAndDispatch(
                passager,
                NotificationType.RESERVATION_CANCELLED,
                "R\u00e9servation annul\u00e9e",
                "Votre r\u00e9servation pour " + trajetLabel + " a \u00e9t\u00e9 annul\u00e9e. Vos points ont \u00e9t\u00e9 rembours\u00e9s",
                "TRAJET",
                trajet.getId()
        );
    }

    public void notifyReservationCancelledToDriver(User conducteur, Trajet trajet, User passager) {
        String trajetLabel = trajet.getVilleDepart() + " \u2192 " + trajet.getVilleArrivee();

        createAndDispatch(
                conducteur,
                NotificationType.RESERVATION_CANCELLED,
                "R\u00e9servation annul\u00e9e",
                passager.getEmail() + " a annul\u00e9 sa r\u00e9servation pour " + trajetLabel,
                "TRAJET",
                trajet.getId()
        );
    }

    public void notifyPointsDebited(User passager, int points, String itineraire, Long trajetId) {
        createAndDispatch(
                passager,
                NotificationType.POINTS_DEBITED,
                "-" + points + " points",
                points + " points d\u00e9bit\u00e9s pour la r\u00e9servation du trajet " + itineraire,
                "TRAJET",
                trajetId
        );
    }

    public void notifyTrajetDeleted(List<User> passagers, Trajet trajet) {
        String trajetLabel = trajet.getVilleDepart() + " \u2192 " + trajet.getVilleArrivee();

        for (User passager : passagers) {
            try {
                createAndDispatch(
                        passager,
                        NotificationType.TRAJET_DELETED,
                        "Trajet supprim\u00e9",
                        "Le trajet " + trajetLabel + " a \u00e9t\u00e9 supprim\u00e9 par le conducteur",
                        "TRAJET",
                        trajet.getId()
                );
            } catch (Exception e) {
                log.error("Erreur notification TRAJET_DELETED pour {}: {}", passager.getEmail(), e.getMessage());
            }

            sendEmailSafely(() -> emailService.sendTrajetDeletedEmail(passager.getEmail(), trajetLabel));
        }
    }

    public void notifyPointsCredited(User conducteur, int points, String itineraire, Long trajetId) {
        createAndDispatch(
                conducteur,
                NotificationType.POINTS_CREDITED,
                "+" + points + " points !",
                "Vous avez gagn\u00e9 " + points + " points pour le trajet " + itineraire,
                "TRAJET",
                trajetId
        );
    }

    public void notifyLevelUp(User user, String levelLabel, String avantages) {
        createAndDispatch(
                user,
                NotificationType.LEVEL_UP,
                "Niveau " + levelLabel + " d\u00e9bloqu\u00e9 !",
                "F\u00e9licitations ! Vous \u00eates maintenant " + levelLabel + ". " + avantages,
                "LEVEL",
                null
        );
    }

    public List<NotificationResponseDto> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouv\u00e9"));

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public NotificationResponseDto markAsRead(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouv\u00e9"));

        Notification notif = notificationRepository.findByIdAndRecipientId(notificationId, user.getId())
                .orElseThrow(() -> new NotFoundException("Notification non trouv\u00e9e"));

        notif.setIsRead(true);
        Notification saved = notificationRepository.save(notif);
        return toDto(saved);
    }

    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouv\u00e9"));

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
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouv\u00e9"));

        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    private String buildConducteurName(Trajet trajet) {
        try {
            User conducteur = trajet.getConducteur();
            String firstname = conducteur.getFirstname() != null ? conducteur.getFirstname() : "";
            String lastname = conducteur.getLastname() != null ? conducteur.getLastname() : "";
            return (firstname + " " + lastname).trim();
        } catch (Exception e) {
            log.warn("Impossible de recuperer le nom du conducteur: {}", e.getMessage());
            return "le conducteur";
        }
    }

    private void sendEmailSafely(Runnable emailAction) {
        try {
            emailAction.run();
        } catch (Exception e) {
            log.warn("Envoi email echoue: {}", e.getMessage());
        }
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
