package com.appcovoiturage.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponseDto {
    private Long id;
    private Long trajetId;
    private Long otherUserId;
    private String otherUserName;
    private LocalDateTime createdAt;
    private long unreadCount;
}