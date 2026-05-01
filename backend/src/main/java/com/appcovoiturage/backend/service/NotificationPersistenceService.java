package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.NotificationResponseDto;
import com.appcovoiturage.backend.entity.Notification;
import com.appcovoiturage.backend.entity.NotificationType;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.NotificationRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPersistenceService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationResponseDto saveNotification(
            Long recipientId,
            NotificationType type,
            String title,
            String content,
            String referenceType,
            Long referenceId
    ) {
        User managedRecipient = userRepository.getReferenceById(recipientId);

        Notification notification = Notification.builder()
                .recipient(managedRecipient)
                .type(type)
                .title(title)
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();

        log.info("Persisting notification type={} recipientId={} title={}", type, recipientId, title);
        Notification saved = notificationRepository.save(notification);
        log.info("Notification persisted id={}", saved.getId());
        return toDto(saved);
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
