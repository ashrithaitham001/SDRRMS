package com.sdrrms.controller;

import com.sdrrms.dto.request.MissionDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.Mission;
import com.sdrrms.entity.Mission.MissionStatus;
import com.sdrrms.entity.MissionAssignment;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuthService;
import com.sdrrms.service.MissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/missions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MissionController {

    @Autowired
    private MissionService missionService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Mission>>> getAllMissions(@RequestParam(required = false) MissionStatus status) {
        List<Mission> missions = missionService.getAllMissions(status);
        return ResponseEntity.ok(ApiResponse.success("Relief missions list", missions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Mission>> getMissionById(@PathVariable Long id) {
        Mission mission = missionService.getMissionById(id);
        return ResponseEntity.ok(ApiResponse.success("Mission details", mission));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL')")
    public ResponseEntity<ApiResponse<Mission>> createMission(@Valid @RequestBody MissionDto dto) {
        User user = authService.getCurrentUser();
        Mission mission = missionService.createMission(dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Mission created successfully", mission));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'NGO_REPRESENTATIVE')")
    public ResponseEntity<ApiResponse<Mission>> updateMissionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUser();
        MissionStatus status = MissionStatus.valueOf(body.get("status"));
        Mission updated = missionService.updateMissionStatus(id, status, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Mission status updated to " + status, updated));
    }

    @PostMapping("/{id}/assign-volunteer")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'NGO_REPRESENTATIVE')")
    public ResponseEntity<ApiResponse<MissionAssignment>> assignVolunteer(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User user = authService.getCurrentUser();
        Long volunteerId = Long.valueOf(body.get("volunteerId").toString());
        String notes = (String) body.get("notes");
        MissionAssignment assignment = missionService.assignVolunteerToMission(id, volunteerId, notes, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Volunteer assigned to mission successfully", assignment));
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<ApiResponse<List<MissionAssignment>>> getMissionAssignments(@PathVariable Long id) {
        List<MissionAssignment> assignments = missionService.getMissionAssignments(id);
        return ResponseEntity.ok(ApiResponse.success("Mission assignments", assignments));
    }
}
