package com.sdrrms.service;

import com.sdrrms.dto.request.EmergencyAlertDto;
import com.sdrrms.entity.EmergencyAlert;
import com.sdrrms.entity.EmergencyAlert.AlertSeverity;
import com.sdrrms.entity.EmergencyAlert.AlertStatus;

import java.util.List;

public interface AlertService {
    List<EmergencyAlert> getAllAlerts(AlertStatus status, AlertSeverity severity, String search);
    EmergencyAlert getAlertById(Long id);
    EmergencyAlert publishAlert(EmergencyAlertDto dto, Long publishedByUserId);
    EmergencyAlert updateAlertStatus(Long id, AlertStatus status, Long handledByUserId);
    List<EmergencyAlert> getActiveAlerts();
}
