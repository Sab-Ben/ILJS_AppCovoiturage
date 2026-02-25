package com.appcovoiturage.backend.service;

import com.appcovoiturage.backend.entity.Notification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendNotificationToUser(Long userId, Notification notification) {
        // Topic dédié par utilisateur (à écouter côté front)
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, notification);
    }
}