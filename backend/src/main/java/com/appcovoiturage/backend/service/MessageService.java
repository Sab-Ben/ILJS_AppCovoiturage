package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.MessageRequestDto;
import com.appcovoiturage.backend.dto.MessageResponseDto;
import com.appcovoiturage.backend.dto.WsEventDto;
import com.appcovoiturage.backend.entity.Conversation;
import com.appcovoiturage.backend.entity.Message;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.exception.BadRequestException;
import com.appcovoiturage.backend.exception.NotFoundException;
import com.appcovoiturage.backend.repository.MessageRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConversationService conversationService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final NotificationService notificationService;

    public MessageResponseDto sendMessage(Long conversationId, MessageRequestDto dto, String userEmail) {
        Conversation conversation = conversationService.getConversationIfParticipant(conversationId, userEmail);

        User sender = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        String content = dto.getContent().trim();
        if (content.isBlank()) {
            throw new BadRequestException("Le message ne peut pas être vide");
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();

        Message saved = messageRepository.save(message);
        MessageResponseDto response = toDto(saved);

        simpMessagingTemplate.convertAndSend(
                "/topic/conversations/" + conversationId,
                WsEventDto.builder()
                        .type("MESSAGE_CREATED")
                        .payload(response)
                        .build()
        );

        User recipient = conversation.getConducteur().getId().equals(sender.getId())
                ? conversation.getPassager()
                : conversation.getConducteur();

        String trajetLabel = conversation.getTrajet().getVilleDepart() + " → " + conversation.getTrajet().getVilleArrivee();

        // ✅ ICI on passe bien un User
        notificationService.notifyMessageReceived(recipient, conversation.getId(), trajetLabel);

        return response;
    }

    public List<MessageResponseDto> getMessages(Long conversationId, String userEmail) {
        conversationService.getConversationIfParticipant(conversationId, userEmail);

        return messageRepository.findByConversationIdOrderBySentAtAsc(conversationId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private MessageResponseDto toDto(Message m) {
        return MessageResponseDto.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderEmail(m.getSender().getEmail())
                .content(m.getContent())
                .sentAt(m.getSentAt())
                .build();
    }
}
