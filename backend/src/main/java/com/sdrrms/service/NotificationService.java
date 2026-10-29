package com.sdrrms.service;

import com.sdrrms.entity.Notification;
import com.sdrrms.entity.Notification.DeliveryChannel;
import com.sdrrms.entity.Notification.NotificationType;
import com.sdrrms.entity.User;

import java.util.List;

public interface NotificationService {
    Notification sendNotification(User recipient, String title, String message, NotificationType type, DeliveryChannel channel, String referenceId);
    void broadcastEmergencyNotification(String title, String message, String referenceId);
    List<Notification> getUserNotifications(Long userId);
    List<Notification> getUnreadNotifications(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
