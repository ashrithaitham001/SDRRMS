package com.sdrrms.dto.request;

import com.sdrrms.entity.EmergencyAlert.AlertSeverity;
import com.sdrrms.entity.EmergencyAlert.AlertStatus;
import com.sdrrms.entity.EmergencyAlert.BroadcastChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class EmergencyAlertDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotBlank(message = "Affected area is required")
    private String affectedArea;

    @NotNull(message = "Severity is required")
    private AlertSeverity severity;

    private Long disasterId;
    private AlertStatus status = AlertStatus.ACTIVE;
    private BroadcastChannel broadcastChannel = BroadcastChannel.ALL;
    private LocalDateTime expiresAt;

    public EmergencyAlertDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAffectedArea() { return affectedArea; }
    public void setAffectedArea(String affectedArea) { this.affectedArea = affectedArea; }

    public AlertSeverity getSeverity() { return severity; }
    public void setSeverity(AlertSeverity severity) { this.severity = severity; }

    public Long getDisasterId() { return disasterId; }
    public void setDisasterId(Long disasterId) { this.disasterId = disasterId; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public BroadcastChannel getBroadcastChannel() { return broadcastChannel; }
    public void setBroadcastChannel(BroadcastChannel broadcastChannel) { this.broadcastChannel = broadcastChannel; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
