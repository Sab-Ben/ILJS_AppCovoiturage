package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.UserDto;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.UserRepository;
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


    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        return ResponseEntity.ok(mapToDto(currentUser));
    }


    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto userDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (userDto.getFirstname() != null) currentUser.setFirstname(userDto.getFirstname());
        if (userDto.getLastname() != null) currentUser.setLastname(userDto.getLastname());

        User updatedUser = userRepository.save(currentUser);
        return ResponseEntity.ok(mapToDto(updatedUser));
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .pointBalance(user.getPointBalance()) // US6
                .role(user.getRole())
                .build();
    }
}