package com.sdrrms.controller;

import com.sdrrms.dto.request.EmergencyAlertDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.EmergencyAlert;
import com.sdrrms.entity.EmergencyAlert.AlertSeverity;
import com.sdrrms.entity.EmergencyAlert.AlertStatus;
import com.sdrrms.entity.User;
import com.sdrrms.service.AlertService;
import com.sdrrms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alerts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AlertController {

    @Autowired
    private AlertService alertService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmergencyAlert>>> getAllAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) String search) {
        List<EmergencyAlert> alerts = alertService.getAllAlerts(status, severity, search);
        return ResponseEntity.ok(ApiResponse.success("Emergency alerts list", alerts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmergencyAlert>> getAlertById(@PathVariable Long id) {
        EmergencyAlert alert = alertService.getAlertById(id);
        return ResponseEntity.ok(ApiResponse.success("Emergency alert details", alert));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL')")
    public ResponseEntity<ApiResponse<EmergencyAlert>> publishAlert(@Valid @RequestBody EmergencyAlertDto dto) {
        User user = authService.getCurrentUser();
        EmergencyAlert alert = alertService.publishAlert(dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Emergency alert published successfully", alert));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL')")
    public ResponseEntity<ApiResponse<EmergencyAlert>> updateAlertStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUser();
        AlertStatus status = AlertStatus.valueOf(body.get("status"));
        EmergencyAlert alert = alertService.updateAlertStatus(id, status, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Emergency alert status updated to " + status, alert));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EmergencyAlert>>> getActiveAlerts() {
        List<EmergencyAlert> active = alertService.getActiveAlerts();
        return ResponseEntity.ok(ApiResponse.success("Active emergency warnings", active));
    }
}
