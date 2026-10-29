package com.sdrrms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    public enum NotificationType {
        ALERT,
        REQUEST_UPDATE,
        MISSION_ASSIGNMENT,
        DONATION_CONFIRMED,
        SOS_ALERT,
        SYSTEM
    }

    public enum DeliveryChannel {
        IN_APP,
        EMAIL_SIMULATED,
        SMS_SIMULATED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType notificationType;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private boolean isSimulated = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private DeliveryChannel deliveryChannel = DeliveryChannel.IN_APP;

    @Column(length = 100)
    private String referenceId;

    private LocalDateTime createdAt;

    public Notification() {}

    public Notification(User recipient, String title, String message, NotificationType notificationType,
                        DeliveryChannel deliveryChannel, String referenceId) {
        this.recipient = recipient;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
        this.deliveryChannel = deliveryChannel;
        this.referenceId = referenceId;
        this.isRead = false;
        this.isSimulated = (deliveryChannel != DeliveryChannel.IN_APP);
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getNotificationType() { return notificationType; }
    public void setNotificationType(NotificationType notificationType) { this.notificationType = notificationType; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public boolean isSimulated() { return isSimulated; }
    public void setSimulated(boolean simulated) { isSimulated = simulated; }

    public DeliveryChannel getDeliveryChannel() { return deliveryChannel; }
    public void setDeliveryChannel(DeliveryChannel deliveryChannel) { this.deliveryChannel = deliveryChannel; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
