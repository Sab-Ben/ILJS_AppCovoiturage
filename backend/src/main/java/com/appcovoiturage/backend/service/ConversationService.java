package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.ConversationResponseDto;
import com.appcovoiturage.backend.entity.Conversation;
import com.appcovoiturage.backend.entity.Trajet;
import com.appcovoiturage.backend.entity.User;
import com.appcovoiturage.backend.exception.BadRequestException;
import com.appcovoiturage.backend.exception.ForbiddenException;
import com.appcovoiturage.backend.exception.NotFoundException;
import com.appcovoiturage.backend.repository.ConversationRepository;
import com.appcovoiturage.backend.repository.ReservationRepository;
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
    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    public ConversationResponseDto openOrCreateConversation(Long trajetId, Long requestedPassagerId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new NotFoundException("Trajet non trouvé"));

        User conducteur = trajet.getConducteur();
        User passager;

        // Déterminer qui est le passager de cette conversation
        if (currentUser.getId().equals(conducteur.getId())) {
            // C'est le conducteur qui initie la demande
            if (requestedPassagerId == null) {
                throw new BadRequestException("L'ID du passager est requis pour le conducteur");
            }
            passager = userRepository.findById(requestedPassagerId)
                    .orElseThrow(() -> new NotFoundException("Passager non trouvé"));
        } else {
            // C'est le passager qui initie la demande
            passager = currentUser;
        }

        if (conducteur.getId().equals(passager.getId())) {
            throw new BadRequestException("Le conducteur ne peut pas se contacter lui-même");
        }

        // OPTIONNEL : Vérifier qu'une réservation existe bien entre eux
        /* boolean hasReservation = reservationRepository.existsByTrajetIdAndPassagerIdAndStatus(
            trajetId, passager.getId(), ReservationStatus.ACCEPTED // ou PENDING
        );
        if (!hasReservation) {
            throw new ForbiddenException("Il faut une réservation pour communiquer.");
        }
        */

        Conversation conversation = conversationRepository
                .findByTrajetIdAndPassagerId(trajetId, passager.getId())
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder()
                                .trajet(trajet)
                                .conducteur(conducteur)
                                .passager(passager)
                                .createdAt(LocalDateTime.now())
                                .build()
                ));

        return toDto(conversation);
    }

    public List<ConversationResponseDto> getMyConversations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        return conversationRepository
                .findByPassagerIdOrConducteurIdOrderByCreatedAtDesc(user.getId(), user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public Conversation getConversationIfParticipant(Long conversationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Utilisateur non trouvé"));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversation non trouvée"));

        boolean isParticipant =
                conversation.getConducteur().getId().equals(user.getId()) ||
                        conversation.getPassager().getId().equals(user.getId());

        if (!isParticipant) {
            throw new ForbiddenException("Accès refusé à cette conversation");
        }

        return conversation;
    }

    private ConversationResponseDto toDto(Conversation c) {
        return ConversationResponseDto.builder()
                .id(c.getId())
                .trajetId(c.getTrajet().getId())
                .conducteurId(c.getConducteur().getId())
                .conducteurEmail(c.getConducteur().getEmail())
                .passagerId(c.getPassager().getId())
                .passagerEmail(c.getPassager().getEmail())
                .villeDepart(c.getTrajet().getVilleDepart())
                .villeArrivee(c.getTrajet().getVilleArrivee())
                .createdAt(c.getCreatedAt())
                .build();
    }
}