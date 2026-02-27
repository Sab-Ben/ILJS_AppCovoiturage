package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.ConversationResponseDto;
import com.appcovoiturage.backend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;


    // Inbox des conversations de l'utilisateur connecté
    @GetMapping("/conversations/me")
    public ResponseEntity<List<ConversationResponseDto>> getMyConversations(Principal principal) {
        return ResponseEntity.ok(
                conversationService.getMyConversations(principal.getName())
        );
    }

    @PostMapping("/trajets/{trajetId}/conversations")
    public ResponseEntity<ConversationResponseDto> openConversation(
            @PathVariable Long trajetId,
            @RequestParam(required = false) Long passagerId, // Nouveau paramètre
            Principal principal
    ) {
        return ResponseEntity.ok(
                conversationService.openOrCreateConversation(trajetId, passagerId, principal.getName())
        );
    }
}