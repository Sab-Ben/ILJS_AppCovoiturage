package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.UpdateUserRequest;
import com.appcovoiturage.backend.dto.UserDto;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // US5 & US6 : Récupérer profil et solde
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(mapToDto(user));
    }

    // US4 : Modifier le profil
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestBody @Valid UpdateUserRequest request) {
        User user = getAuthenticatedUser();

        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());

        User updatedUser = userRepository.save(user); // Persistence en base
        return ResponseEntity.ok(mapToDto(updatedUser));
    }

    // Méthode utilitaire pour récupérer l'user connecté
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    // Méthode utilitaire de mapping (User -> UserDto)
    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .pointBalance(user.getPointBalance())
                .role(user.getRole())
                .build();
    }
}