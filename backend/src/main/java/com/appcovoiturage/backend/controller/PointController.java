package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.PointBalanceDto;
import com.appcovoiturage.backend.dto.PointTransactionDto;
import com.appcovoiturage.backend.service.PointService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/points")
@RequiredArgsConstructor
public class PointController {

    private final PointService pointService;

    @GetMapping("/balance")
    public ResponseEntity<PointBalanceDto> getBalance(Authentication authentication) {
        return ResponseEntity.ok(pointService.getBalance(authentication.getName()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<PointTransactionDto>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(pointService.getTransactionHistory(authentication.getName()));
    }
}
