package com.placementportal.controller;

import com.placementportal.model.Notification;
import com.placementportal.model.User;
import com.placementportal.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal User user) {
        // Most recent first; frontend can slice for a dropdown preview
        return ResponseEntity.ok(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal User user) {
        long count = notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@AuthenticationPrincipal User user, @PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not your notification"));
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal User user) {
        List<Notification> all = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        all.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(all);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
