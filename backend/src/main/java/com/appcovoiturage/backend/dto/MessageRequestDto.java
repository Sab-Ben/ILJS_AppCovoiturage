package com.appcovoiturage.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequestDto {

    @NotBlank(message = "Le message ne peut pas être vide")
    @Size(max = 1000, message = "Le message ne peut pas dépasser 1000 caractères")
    private String content;
}