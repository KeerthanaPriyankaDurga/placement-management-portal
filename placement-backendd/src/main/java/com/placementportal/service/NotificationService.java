package com.placementportal.service;

import com.placementportal.model.Notification;
import com.placementportal.model.User;
import com.placementportal.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void notify(User recipient, String message, String type) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setType(type);
        notificationRepository.save(notification);
    }
}
