package com.appcovoiturage.backend.controller;

import com.appcovoiturage.backend.dto.NotificationResponseDto;
import com.appcovoiturage.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/notifications", "/api/v1/notifications"})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    public List<NotificationResponseDto> getMyNotifications(Principal principal) {
        return notificationService.getMyNotifications(principal.getName());
    }

    @PatchMapping("/{id}/read")
    public NotificationResponseDto markAsRead(@PathVariable Long id, Principal principal) {
        return notificationService.markAsRead(id, principal.getName());
    }

    @PatchMapping("/me/read-all")
    public void markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
    }

    @GetMapping("/me/unread-count")
    public Map<String, Long> getUnreadCount(Principal principal) {
        long count = notificationService.getUnreadCount(principal.getName());
        return Map.of("count", count);
    }
    
    @GetMapping
    public List<NotificationResponseDto> legacyGetMyNotifications(Principal principal) {
        return getMyNotifications(principal);
    }

    @PutMapping("/{id}/read")
    public NotificationResponseDto legacyMarkAsRead(@PathVariable Long id, Principal principal) {
        return markAsRead(id, principal);
    }

    @PutMapping("/read-all")
    public void legacyMarkAllAsRead(Principal principal) {
        markAllAsRead(principal);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> legacyGetUnreadCount(Principal principal) {
        return getUnreadCount(principal);
    }
}