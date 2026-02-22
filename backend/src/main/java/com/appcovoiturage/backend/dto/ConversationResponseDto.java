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

    private Long conducteurId;
    private String conducteurEmail;

    private Long passagerId;
    private String passagerEmail;

    private String villeDepart;
    private String villeArrivee;

    private LocalDateTime createdAt;
}