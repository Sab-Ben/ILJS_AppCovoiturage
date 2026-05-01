package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByTrajetIdAndPassagerId(Long trajetId, Long passagerId);

    List<Conversation> findByPassagerIdOrderByCreatedAtDesc(Long passagerId);

    List<Conversation> findByConducteurIdOrderByCreatedAtDesc(Long conducteurId);

    List<Conversation> findByPassagerIdOrConducteurIdOrderByCreatedAtDesc(Long passagerId, Long conducteurId);
}