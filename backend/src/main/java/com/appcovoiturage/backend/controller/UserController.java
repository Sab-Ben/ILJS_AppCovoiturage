package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.UserDto;
import com.appcovoiturage.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    /**
     * Récupère le profil de l'utilisateur actuellement connecté.
     * L'utilisateur est identifié grâce au Token JWT dans le header.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        // 1. Récupérer l'utilisateur depuis le contexte de sécurité (peuplé par le JwtAuthenticationFilter)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // 2. Mapper l'entité User vers le DTO pour ne pas renvoyer le mot de passe
        UserDto userDto = UserDto.builder()
                .id(currentUser.getId())
                .firstname(currentUser.getFirstname())
                .lastname(currentUser.getLastname())
                .email(currentUser.getEmail())
                .pointBalance(currentUser.getPointBalance())
                .role(currentUser.getRole())
                .build();

        return ResponseEntity.ok(userDto);
    }
}