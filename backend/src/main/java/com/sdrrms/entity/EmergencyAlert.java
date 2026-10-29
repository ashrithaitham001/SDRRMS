package com.sdrrms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_alerts")
public class EmergencyAlert {

    public enum AlertSeverity {
        ADVISORY,
        WATCH,
        WARNING,
        CRITICAL_EVACUATION
    }

    public enum AlertStatus {
        ACTIVE,
        EXPIRED,
        CANCELLED
    }

    public enum BroadcastChannel {
        ALL,
        IN_APP,
        SMS_SIMULATED,
        EMAIL_SIMULATED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String affectedArea;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AlertSeverity severity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "disaster_id")
    private Disaster disaster;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AlertStatus status = AlertStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private BroadcastChannel broadcastChannel = BroadcastChannel.ALL;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "published_by_user_id")
    private User publishedBy;

    private LocalDateTime publishedAt;
    private LocalDateTime expiresAt;

    public EmergencyAlert() {}

    @PrePersist
    protected void onCreate() {
        if (this.publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAffectedArea() { return affectedArea; }
    public void setAffectedArea(String affectedArea) { this.affectedArea = affectedArea; }

    public AlertSeverity getSeverity() { return severity; }
    public void setSeverity(AlertSeverity severity) { this.severity = severity; }

    public Disaster getDisaster() { return disaster; }
    public void setDisaster(Disaster disaster) { this.disaster = disaster; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public BroadcastChannel getBroadcastChannel() { return broadcastChannel; }
    public void setBroadcastChannel(BroadcastChannel broadcastChannel) { this.broadcastChannel = broadcastChannel; }

    public User getPublishedBy() { return publishedBy; }
    public void setPublishedBy(User publishedBy) { this.publishedBy = publishedBy; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
