package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.TrajetDto;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.service.TrajetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;
import com.appcovoiturage.backend.dto.CompletedTrajetDto;



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

    @GetMapping("/search")
    public ResponseEntity<java.util.List<Trajet>> search(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam LocalDate date
    ) {
        return ResponseEntity.ok(trajetService.searchTrajets(from, to, date));
    }

    @GetMapping("/completed")
    public ResponseEntity<java.util.List<CompletedTrajetDto>> getCompleted(Principal principal) {
        return ResponseEntity.ok(trajetService.getCompletedTrajets(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trajet> getById(@PathVariable Long id) {
        return ResponseEntity.ok(trajetService.getTrajetById(id));
    }


}