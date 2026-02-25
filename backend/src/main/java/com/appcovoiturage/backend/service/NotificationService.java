package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.NotificationResponseDto;
import com.appcovoiturage.backend.entity.Notification;
import com.appcovoiturage.backend.entity.NotificationType;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.NotificationRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationResponseDto> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public NotificationResponseDto markAsRead(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Notification n = notificationRepository.findByIdAndRecipientId(notificationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        n.setIsRead(true);
        return toDto(notificationRepository.save(n));
    }

    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Notification> list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
    }

    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    // ===== Notifications métier =====

    public void notifyTrajetCreated(User recipient, Trajet trajet) {
        create(
                recipient,
                NotificationType.TRAJET_CREATED,
                "Trajet créé",
                "Votre trajet a été créé : " + trajet.getVilleDepart() + " -> " + trajet.getVilleArrivee(),
                "TRAJET",
                trajet.getId()
        );
    }

    public void notifyTrajetUpdated(User recipient, Trajet trajet) {
        create(
                recipient,
                NotificationType.TRAJET_UPDATED,
                "Trajet modifié",
                "Votre trajet a été modifié : " + trajet.getVilleDepart() + " -> " + trajet.getVilleArrivee(),
                "TRAJET",
                trajet.getId()
        );
    }

    public void notifyTrajetDeleted(User recipient, String trajetLabel) {
        create(
                recipient,
                NotificationType.TRAJET_DELETED,
                "Trajet supprimé",
                "Votre trajet a été supprimé : " + trajetLabel,
                "TRAJET",
                null
        );
    }

    public void notifyReservationCreated(User recipient, Trajet trajet, User passager) {
        create(
                recipient,
                NotificationType.RESERVATION_CREATED,
                "Nouvelle réservation",
                passager.getFirstname() + " " + passager.getLastname()
                        + " a réservé votre trajet " + trajet.getVilleDepart() + " -> " + trajet.getVilleArrivee(),
                "RESERVATION",
                trajet.getId()
        );
    }

    public void notifyReservationDeleted(User recipient, Trajet trajet, User passager) {
        create(
                recipient,
                NotificationType.RESERVATION_DELETED,
                "Réservation annulée",
                passager.getFirstname() + " " + passager.getLastname()
                        + " a annulé sa réservation pour le trajet " + trajet.getVilleDepart() + " -> " + trajet.getVilleArrivee(),
                "RESERVATION",
                trajet.getId()
        );
    }

    public void notifyMessageReceived(User recipient, Long conversationId, String trajetLabel) {
        create(
                recipient,
                NotificationType.MESSAGE_RECEIVED,
                "Nouveau message",
                "Vous avez reçu un nouveau message (" + trajetLabel + ").",
                "CONVERSATION",
                conversationId
        );
    }

    // ===== Helpers =====

    private void create(User recipient,
                        NotificationType type,
                        String title,
                        String content,
                        String referenceType,
                        Long referenceId) {

        Notification n = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();

        notificationRepository.save(n);
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