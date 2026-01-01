package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.AuthenticationRequest;
import com.appcovoiturage.backend.dto.AuthenticationResponse;
import com.appcovoiturage.backend.dto.RegisterRequest;
import com.appcovoiturage.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(service.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage() != null ? AuthenticationResponse.builder().token(e.getMessage()).build() : null);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}
