package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.NotificationResponseDto;
import com.appcovoiturage.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponseDto> getMyNotifications(Principal principal) {
        return notificationService.getMyNotifications(principal.getName());
    }

    @PutMapping("/{id}/read")
    public NotificationResponseDto markAsRead(@PathVariable Long id, Principal principal) {
        return notificationService.markAsRead(id, principal.getName());
    }

    @PutMapping("/read-all")
    public void markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Principal principal) {
        long count = notificationService.getUnreadCount(principal.getName());
        return Map.of("count", count);
    }
}