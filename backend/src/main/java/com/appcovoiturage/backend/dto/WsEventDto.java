package com.appcovoiturage.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WsEventDto {
    private String type;   // ex: "MESSAGE", "NOTIFICATION"
    private Object payload;
}