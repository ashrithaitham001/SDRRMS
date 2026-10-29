package com.sdrrms.controller;

import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.dto.response.DashboardStatsResponse;
import com.sdrrms.entity.*;
import com.sdrrms.entity.Disaster.Status;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.repository.*;
import com.sdrrms.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private ReliefRequestRepository reliefRequestRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics", stats));
    }

    @GetMapping("/map-overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMapOverview() {
        Map<String, Object> mapData = new HashMap<>();

        // 1. Disasters with coordinates
        List<Disaster> disasters = disasterRepository.findByStatus(Status.ACTIVE).stream()
                .filter(d -> d.getLatitude() != null && d.getLongitude() != null)
                .collect(Collectors.toList());
        mapData.put("disasters", disasters);

        // 2. Relief Requests with coordinates
        List<ReliefRequest> requests = reliefRequestRepository.findAll().stream()
                .filter(r -> r.getLatitude() != null && r.getLongitude() != null)
                .collect(Collectors.toList());
        mapData.put("requests", requests);

        // 3. Storage / Resource warehouses with coordinates
        List<Resource> resources = resourceRepository.findAll().stream()
                .filter(r -> r.getLatitude() != null && r.getLongitude() != null)
                .collect(Collectors.toList());
        mapData.put("resources", resources);

        // 4. Hospitals
        List<Hospital> hospitals = hospitalRepository.findAll().stream()
                .filter(h -> h.getLatitude() != null && h.getLongitude() != null)
                .collect(Collectors.toList());
        mapData.put("hospitals", hospitals);

        // 5. Active/Available volunteers with coordinates
        List<VolunteerProfile> volunteers = volunteerProfileRepository.findByAvailabilityStatus(AvailabilityStatus.AVAILABLE).stream()
                .filter(v -> v.getCurrentLatitude() != null && v.getCurrentLongitude() != null)
                .collect(Collectors.toList());
        mapData.put("volunteers", volunteers);

        return ResponseEntity.ok(ApiResponse.success("Geographic disaster map coordinates", mapData));
    }
}
