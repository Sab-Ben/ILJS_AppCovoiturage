package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUser1_IdOrUser2_IdOrderByCreatedAtDesc(Long user1Id, Long user2Id);

    Optional<Conversation> findByIdAndUser1_IdOrIdAndUser2_Id(Long id1, Long user1Id, Long id2, Long user2Id);

    Optional<Conversation> findByTrajet_IdAndUser1_IdAndUser2_Id(Long trajetId, Long user1Id, Long user2Id);

    Optional<Conversation> findByTrajet_IdAndUser2_IdAndUser1_Id(Long trajetId, Long user2Id, Long user1Id);
}