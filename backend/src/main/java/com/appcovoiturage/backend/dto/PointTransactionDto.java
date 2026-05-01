package com.appcovoiturage.backend.dto;

import com.appcovoiturage.backend.entity.PointTransactionType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointTransactionDto {
    private Long id;
    private PointTransactionType type;
    private Integer amount;
    private String description;
    private LocalDateTime createdAt;
    private Long trajetId;
}
