package com.sdrrms.controller;

import com.sdrrms.dto.request.ReliefRequestDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.dto.response.DashboardStatsResponse;
import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.EmergencyAlert;
import com.sdrrms.entity.ReliefRequest;
import com.sdrrms.service.AlertService;
import com.sdrrms.service.DashboardService;
import com.sdrrms.service.DisasterService;
import com.sdrrms.service.ReliefRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DisasterService disasterService;

    @Autowired
    private AlertService alertService;

    @Autowired
    private ReliefRequestService reliefRequestService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getPublicStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Public dashboard statistics", stats));
    }

    @GetMapping("/active-disasters")
    public ResponseEntity<ApiResponse<List<Disaster>>> getActiveDisasters() {
        List<Disaster> disasters = disasterService.getActiveDisasters();
        return ResponseEntity.ok(ApiResponse.success("Active disaster incidents", disasters));
    }

    @GetMapping("/active-alerts")
    public ResponseEntity<ApiResponse<List<EmergencyAlert>>> getActiveAlerts() {
        List<EmergencyAlert> alerts = alertService.getActiveAlerts();
        return ResponseEntity.ok(ApiResponse.success("Active emergency warnings", alerts));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ApiResponse<ReliefRequest>> trackRequest(@PathVariable String trackingNumber) {
        ReliefRequest request = reliefRequestService.getRequestByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(ApiResponse.success("Tracking relief request", request));
    }

    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<ReliefRequest>> submitPublicSos(@RequestBody ReliefRequestDto dto) {
        ReliefRequest request = reliefRequestService.submitSosEmergency(dto, null);
        return ResponseEntity.ok(ApiResponse.success("EMERGENCY SOS DISPATCHED! Reference Number: " + request.getTrackingNumber(), request));
    }
}
