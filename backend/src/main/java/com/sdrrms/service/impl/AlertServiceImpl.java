package com.sdrrms.service.impl;

import com.sdrrms.dto.request.EmergencyAlertDto;
import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.EmergencyAlert;
import com.sdrrms.entity.EmergencyAlert.AlertSeverity;
import com.sdrrms.entity.EmergencyAlert.AlertStatus;
import com.sdrrms.entity.User;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.DisasterRepository;
import com.sdrrms.repository.EmergencyAlertRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.service.AlertService;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertServiceImpl implements AlertService {

    @Autowired
    private EmergencyAlertRepository alertRepository;

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public List<EmergencyAlert> getAllAlerts(AlertStatus status, AlertSeverity severity, String search) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return alertRepository.searchAlerts(status, severity, cleanSearch);
    }

    @Override
    public EmergencyAlert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency alert not found with id: " + id));
    }

    @Override
    @Transactional
    public EmergencyAlert publishAlert(EmergencyAlertDto dto, Long publishedByUserId) {
        User publisher = publishedByUserId != null ? userRepository.findById(publishedByUserId).orElse(null) : null;
        Disaster disaster = dto.getDisasterId() != null ? disasterRepository.findById(dto.getDisasterId()).orElse(null) : null;

        EmergencyAlert alert = new EmergencyAlert();
        alert.setTitle(dto.getTitle());
        alert.setMessage(dto.getMessage());
        alert.setAffectedArea(dto.getAffectedArea());
        alert.setSeverity(dto.getSeverity());
        alert.setDisaster(disaster);
        alert.setStatus(dto.getStatus() != null ? dto.getStatus() : AlertStatus.ACTIVE);
        alert.setBroadcastChannel(dto.getBroadcastChannel());
        alert.setPublishedBy(publisher);
        alert.setPublishedAt(LocalDateTime.now());
        alert.setExpiresAt(dto.getExpiresAt() != null ? dto.getExpiresAt() : LocalDateTime.now().plusDays(3));

        EmergencyAlert saved = alertRepository.save(alert);

        // Broadcast in-app to all users
        notificationService.broadcastEmergencyNotification(
                "[" + saved.getSeverity() + " ALERT] " + saved.getTitle(),
                saved.getMessage() + " | Affected Area: " + saved.getAffectedArea(),
                saved.getId().toString()
        );

        auditLogService.log("PUBLISH_ALERT", "EmergencyAlert", saved.getId().toString(),
                publisher != null ? publisher.getEmail() : "SYSTEM",
                "Published " + saved.getSeverity() + " alert: " + saved.getTitle());

        return saved;
    }

    @Override
    @Transactional
    public EmergencyAlert updateAlertStatus(Long id, AlertStatus status, Long handledByUserId) {
        EmergencyAlert alert = getAlertById(id);
        alert.setStatus(status);
        EmergencyAlert saved = alertRepository.save(alert);

        auditLogService.log("UPDATE_ALERT_STATUS", "EmergencyAlert", saved.getId().toString(),
                userRepository.findById(handledByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Alert status updated to " + status);
        return saved;
    }

    @Override
    public List<EmergencyAlert> getActiveAlerts() {
        return alertRepository.findByStatusOrderByPublishedAtDesc(AlertStatus.ACTIVE);
    }
}
