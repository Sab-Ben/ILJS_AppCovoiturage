package com.appcovoiturage.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderEmail;
    private String content;
    private LocalDateTime sentAt;
}
