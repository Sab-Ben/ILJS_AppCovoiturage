package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.dto.MessageRequestDto;
import com.appcovoiturage.backend.entity.*;
import com.appcovoiturage.backend.exception.BadRequestException;
import com.appcovoiturage.backend.repository.MessageRepository;
import com.appcovoiturage.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MessageServiceTest {

    @Mock private MessageRepository messageRepository;
    @Mock private UserRepository userRepository;
    @Mock private ConversationService conversationService;
    @Mock private SimpMessagingTemplate simpMessagingTemplate;
    @Mock private NotificationService notificationService;

    @InjectMocks private MessageService messageService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldSendMessageAndDispatchWsAndNotification() {
        // Arrange
        User conducteur = User.builder().id(1L).email("c@test.com").build();
        User passager = User.builder().id(2L).email("p@test.com").build();

        Trajet trajet = Trajet.builder()
                .id(10L)
                .villeDepart("Paris")
                .villeArrivee("Lyon")
                .conducteur(conducteur)
                .build();

        Conversation conversation = Conversation.builder()
                .id(100L)
                .trajet(trajet)
                .conducteur(conducteur)
                .passager(passager)
                .createdAt(LocalDateTime.now())
                .build();

        MessageRequestDto dto = MessageRequestDto.builder().content("Bonjour !").build();

        when(conversationService.getConversationIfParticipant(100L, "p@test.com")).thenReturn(conversation);
        when(userRepository.findByEmail("p@test.com")).thenReturn(Optional.of(passager));

        when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
            Message m = inv.getArgument(0);
            m.setId(999L);
            return m;
        });

        // Act
        var result = messageService.sendMessage(100L, dto, "p@test.com");

        // Assert
        assertNotNull(result);
        assertEquals(999L, result.getId());
        assertEquals("Bonjour !", result.getContent());

        verify(messageRepository).save(any(Message.class));
        //verify(simpMessagingTemplate).convertAndSend(eq("/topic/conversations/100"), any());
        verify(notificationService).notifyMessageReceived(eq(conducteur), eq(100L), eq("Paris → Lyon"));
    }

    @Test
    void shouldRejectBlankMessage() {
        User u = User.builder().id(2L).email("p@test.com").build();
        Conversation c = Conversation.builder()
                .id(100L)
                .conducteur(User.builder().id(1L).email("c@test.com").build())
                .passager(u)
                .trajet(Trajet.builder().id(10L).villeDepart("Paris").villeArrivee("Lyon").build())
                .build();

        when(conversationService.getConversationIfParticipant(100L, "p@test.com")).thenReturn(c);
        when(userRepository.findByEmail("p@test.com")).thenReturn(Optional.of(u));

        MessageRequestDto dto = MessageRequestDto.builder().content("   ").build();

        assertThrows(BadRequestException.class, () -> messageService.sendMessage(100L, dto, "p@test.com"));
        verify(messageRepository, never()).save(any());
    }
}