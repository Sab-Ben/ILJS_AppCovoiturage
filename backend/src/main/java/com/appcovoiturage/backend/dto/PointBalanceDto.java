package com.appcovoiturage.backend.dto;

import com.appcovoiturage.backend.entity.UserLevel;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointBalanceDto {
    private Integer currentBalance;
    private Integer totalEarned;
    private String level;
    private String levelLabel;
    private Integer levelRank;
    private String nextLevel;
    private String nextLevelLabel;
    private Integer pointsToNextLevel;
    private Integer nextLevelThreshold;
    private Integer currentLevelThreshold;
    private Double levelProgressPercent;
    private String levelAvantages;
}
