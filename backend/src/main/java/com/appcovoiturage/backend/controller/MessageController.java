package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.MessageRequestDto;
import com.appcovoiturage.backend.dto.MessageResponseDto;
import com.appcovoiturage.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageResponseDto>> getMessages(
            @PathVariable Long conversationId,
            Principal principal
    ) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, principal.getName()));
    }

    @PostMapping
    public ResponseEntity<MessageResponseDto> send(@RequestBody MessageRequestDto req, Principal principal) {
        return ResponseEntity.ok(messageService.sendMessage(req, principal.getName()));
    }

    @PatchMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long conversationId, Principal principal) {
        messageService.markConversationAsRead(conversationId, principal.getName());
        return ResponseEntity.ok().build();
    }
}