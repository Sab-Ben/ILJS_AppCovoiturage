package com.appcovoiturage.backend.dto;

import com.appcovoiturage.backend.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private NotificationType type;
    private String title;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String referenceType;
    private Long referenceId;
}