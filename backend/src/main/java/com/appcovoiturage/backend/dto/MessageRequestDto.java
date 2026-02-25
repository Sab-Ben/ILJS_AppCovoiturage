package com.appcovoiturage.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequestDto {
    private Long conversationId;
    private String content;
}