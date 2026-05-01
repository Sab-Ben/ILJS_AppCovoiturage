package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.AuthenticationRequest;
import com.appcovoiturage.backend.dto.AuthenticationResponse;
import com.appcovoiturage.backend.dto.RegisterRequest;
import com.appcovoiturage.backend.entity.Role;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.UserRepository;
import com.appcovoiturage.backend.service.jwt.JwtService;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PointService pointService;

    public AuthenticationService(UserRepository repository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 AuthenticationManager authenticationManager,
                                 @Lazy PointService pointService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.pointService = pointService;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        var userOptional = repository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé par un autre compte.");
        }

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CONDUCTEUR)
                .pointBalance(0)
                .totalPointsEarned(0)
                .build();

        repository.save(user);

        pointService.creditSignupBonus(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}
