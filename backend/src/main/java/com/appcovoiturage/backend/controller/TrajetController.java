package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.TrajetDto;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.service.TrajetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/trajets")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TrajetController {

    private final TrajetService trajetService;

    @PostMapping
    public ResponseEntity<Trajet> createTrajet(@RequestBody TrajetDto dto, Principal principal) {
        return ResponseEntity.ok(trajetService.createTrajet(dto, principal.getName()));
    }

    @GetMapping("/me")
    public ResponseEntity<java.util.List<Trajet>> getMyTrajets(Principal principal) {
        return ResponseEntity.ok(trajetService.getTrajetsByConducteur(principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrajet(@PathVariable Long id, Principal principal) {
        trajetService.deleteTrajet(id, principal.getName());
        return ResponseEntity.noContent().build(); // Renvoie 204 No Content (succès sans corps)
    }
}