package com.appcovoiturage.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WsEventDto<T> {
    private String type;   // ex: MESSAGE_CREATED, NOTIFICATION_CREATED
    private T payload;
}