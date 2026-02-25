package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.MessageRequestDto;
import com.appcovoiturage.backend.dto.MessageResponseDto;
import com.appcovoiturage.backend.dto.WsEventDto;
import com.appcovoiturage.backend.entity.Conversation;
import com.appcovoiturage.backend.entity.Message;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.exception.BadRequestException;
import com.appcovoiturage.backend.repository.MessageRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConversationService conversationService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<MessageResponseDto> getMessages(Long conversationId, String email) {
        Conversation c = conversationService.getConversationOrThrow(conversationId, email);
        return messageRepository.findByConversation_IdOrderByCreatedAtAsc(c.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public MessageResponseDto sendMessage(MessageRequestDto req, String email) {
        if (req == null) {
            throw new BadRequestException("Requête invalide");
        }
        if (req.getConversationId() == null) {
            throw new BadRequestException("conversationId requis");
        }
        if (req.getContent() == null || req.getContent().trim().isEmpty()) {
            throw new BadRequestException("Message vide");
        }

        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Utilisateur non trouvé"));

        Conversation c = conversationService.getConversationOrThrow(req.getConversationId(), email);

        Message m = Message.builder()
                .conversation(c)
                .sender(sender)
                .content(req.getContent().trim())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();

        m = messageRepository.save(m);

        // destinataire = l’autre user
        User recipient = c.getUser1().getId().equals(sender.getId()) ? c.getUser2() : c.getUser1();

        String trajetLabel = (c.getTrajet() == null)
                ? "conversation"
                : (c.getTrajet().getVilleDepart() + " -> " + c.getTrajet().getVilleArrivee());

        // notif DB
        notificationService.notifyMessageReceived(recipient, c.getId(), trajetLabel);

        // push websocket
        WsEventDto event = WsEventDto.builder()
                .type("MESSAGE")
                .payload(toDto(m))
                .build();

        //on utilise l’email comme "username" STOMP
        messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/events", event);

        return toDto(m);
    }

    @Transactional
    public void markConversationAsRead(Long conversationId, String email) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Utilisateur non trouvé"));

        Conversation c = conversationService.getConversationOrThrow(conversationId, email);

        List<Message> list = messageRepository.findByConversation_IdOrderByCreatedAtAsc(c.getId());
        list.stream()
                .filter(msg -> !msg.getSender().getId().equals(me.getId()))
                .filter(msg -> Boolean.FALSE.equals(msg.getIsRead()))
                .forEach(msg -> msg.setIsRead(true));

        messageRepository.saveAll(list);
    }

    private MessageResponseDto toDto(Message m) {
        return MessageResponseDto.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getFirstname() + " " + m.getSender().getLastname())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .isRead(m.getIsRead())
                .build();
    }
}