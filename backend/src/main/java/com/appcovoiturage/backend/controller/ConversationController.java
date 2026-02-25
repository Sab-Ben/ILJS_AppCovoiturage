package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.ConversationResponseDto;
import com.appcovoiturage.backend.entity.Conversation;
import com.appcovoiturage.backend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping("/me")
    public ResponseEntity<List<ConversationResponseDto>> getMyConversations(Principal principal) {
        return ResponseEntity.ok(conversationService.getMyConversations(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<Long> createOrGet(
            @RequestParam Long trajetId,
            @RequestParam Long otherUserId,
            Principal principal
    ) {
        Conversation c = conversationService.createOrGetConversation(trajetId, otherUserId, principal.getName());
        return ResponseEntity.ok(c.getId());
    }
}