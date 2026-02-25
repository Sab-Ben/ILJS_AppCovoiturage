package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.ConversationResponseDto;
import com.appcovoiturage.backend.entity.Conversation;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.repository.ConversationRepository;
import com.appcovoiturage.backend.repository.MessageRepository;
import com.appcovoiturage.backend.repository.TrajetRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final TrajetRepository trajetRepository;
    private final MessageRepository messageRepository;

    public List<ConversationResponseDto> getMyConversations(String email) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Conversation> list = conversationRepository
                .findByUser1_IdOrUser2_IdOrderByCreatedAtDesc(me.getId(), me.getId());

        return list.stream().map(c -> toDto(c, me)).toList();
    }

    public Conversation getConversationOrThrow(Long conversationId, String email) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return conversationRepository
                .findByIdAndUser1_IdOrIdAndUser2_Id(conversationId, me.getId(), conversationId, me.getId())
                .orElseThrow(() -> new RuntimeException("Conversation introuvable ou accès refusé"));
    }

    public Conversation createOrGetConversation(Long trajetId, Long otherUserId, String email) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Autre utilisateur introuvable"));

        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new RuntimeException("Trajet introuvable"));

        // éviter doublon (user1/user2 dans les 2 sens)
        return conversationRepository.findByTrajet_IdAndUser1_IdAndUser2_Id(trajetId, me.getId(), other.getId())
                .or(() -> conversationRepository.findByTrajet_IdAndUser2_IdAndUser1_Id(trajetId, me.getId(), other.getId()))
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder()
                                .trajet(trajet)
                                .user1(me)
                                .user2(other)
                                .createdAt(LocalDateTime.now())
                                .build()
                ));
    }

    private ConversationResponseDto toDto(Conversation c, User me) {
        User other = c.getUser1().getId().equals(me.getId()) ? c.getUser2() : c.getUser1();

        long unread = messageRepository.countByConversation_IdAndIsReadFalseAndSender_IdNot(c.getId(), me.getId());

        return ConversationResponseDto.builder()
                .id(c.getId())
                .trajetId(c.getTrajet() == null ? null : c.getTrajet().getId())
                .otherUserId(other.getId())
                .otherUserName(other.getFirstname() + " " + other.getLastname())
                .createdAt(c.getCreatedAt())
                .unreadCount(unread)
                .build();
    }
}