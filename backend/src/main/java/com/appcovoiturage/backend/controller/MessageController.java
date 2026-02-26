package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.MessageRequestDto;
import com.appcovoiturage.backend.dto.MessageResponseDto;
import com.appcovoiturage.backend.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<MessageResponseDto>> getMessages(
            @PathVariable Long conversationId,
            Principal principal
    ) {
        return ResponseEntity.ok(
                messageService.getMessages(conversationId, principal.getName())
        );
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageResponseDto> sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody MessageRequestDto dto,
            Principal principal
    ) {
        return ResponseEntity.ok(
                messageService.sendMessage(conversationId, dto, principal.getName())
        );
    }
}