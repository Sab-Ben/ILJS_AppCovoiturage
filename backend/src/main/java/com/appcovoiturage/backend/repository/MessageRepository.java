package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversation_IdOrderByCreatedAtAsc(Long conversationId);

    long countByConversation_IdAndIsReadFalseAndSender_IdNot(Long conversationId, Long notSenderId);
}