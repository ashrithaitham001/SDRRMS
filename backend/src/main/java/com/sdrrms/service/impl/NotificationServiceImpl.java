package com.sdrrms.service.impl;

import com.sdrrms.entity.Notification;
import com.sdrrms.entity.Notification.DeliveryChannel;
import com.sdrrms.entity.Notification.NotificationType;
import com.sdrrms.entity.User;
import com.sdrrms.repository.NotificationRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.notification.simulation-mode:true}")
    private boolean simulationMode;

    @Override
    @Transactional
    public Notification sendNotification(User recipient, String title, String message,
                                         NotificationType type, DeliveryChannel channel, String referenceId) {
        if (channel != DeliveryChannel.IN_APP && simulationMode) {
            logger.info("[SIMULATED {}] To: {} ({}) | Subject: {} | Message: {}",
                    channel, recipient.getEmail(), recipient.getPhoneNumber(), title, message);
        }

        Notification notification = new Notification(recipient, title, message, type, channel, referenceId);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void broadcastEmergencyNotification(String title, String message, String referenceId) {
        List<User> activeUsers = userRepository.findAll();
        for (User user : activeUsers) {
            Notification notification = new Notification(user, title, message, NotificationType.ALERT,
                    DeliveryChannel.IN_APP, referenceId);
            notificationRepository.save(notification);
        }
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
