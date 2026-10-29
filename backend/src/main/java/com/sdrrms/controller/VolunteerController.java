package com.sdrrms.controller;

import com.sdrrms.dto.request.VolunteerProfileDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.MissionAssignment;
import com.sdrrms.entity.MissionAssignment.AssignmentStatus;
import com.sdrrms.entity.User;
import com.sdrrms.entity.VolunteerProfile;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.entity.VolunteerProfile.VerificationStatus;
import com.sdrrms.service.AuthService;
import com.sdrrms.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/volunteers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VolunteerController {

    @Autowired
    private VolunteerService volunteerService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VolunteerProfile>>> getAllVolunteers(
            @RequestParam(required = false) AvailabilityStatus status,
            @RequestParam(required = false) VerificationStatus verification,
            @RequestParam(required = false) String search) {
        List<VolunteerProfile> volunteers = volunteerService.getAllVolunteers(status, verification, search);
        return ResponseEntity.ok(ApiResponse.success("Volunteers directory", volunteers));
    }

    @GetMapping("/my-profile")
    public ResponseEntity<ApiResponse<VolunteerProfile>> getMyVolunteerProfile() {
        User user = authService.getCurrentUser();
        VolunteerProfile profile = volunteerService.getVolunteerProfileByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Volunteer profile", profile));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<VolunteerProfile>> getVolunteerProfileByUserId(@PathVariable Long userId) {
        VolunteerProfile profile = volunteerService.getVolunteerProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer profile details", profile));
    }

    @PutMapping("/my-profile")
    public ResponseEntity<ApiResponse<VolunteerProfile>> updateMyVolunteerProfile(@RequestBody VolunteerProfileDto dto) {
        User user = authService.getCurrentUser();
        VolunteerProfile profile = volunteerService.updateVolunteerProfile(user.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Volunteer profile updated", profile));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL')")
    public ResponseEntity<ApiResponse<VolunteerProfile>> verifyVolunteer(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUser();
        VerificationStatus status = VerificationStatus.valueOf(body.get("status"));
        VolunteerProfile verified = volunteerService.verifyVolunteer(id, status, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Volunteer verification updated to " + status, verified));
    }

    @GetMapping("/my-assignments")
    public ResponseEntity<ApiResponse<List<MissionAssignment>>> getMyAssignments() {
        User user = authService.getCurrentUser();
        List<MissionAssignment> assignments = volunteerService.getVolunteerAssignments(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Volunteer mission assignments", assignments));
    }

    @PutMapping("/assignments/{assignmentId}/status")
    public ResponseEntity<ApiResponse<MissionAssignment>> updateAssignmentStatus(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, String> body) {
        AssignmentStatus status = AssignmentStatus.valueOf(body.get("status"));
        String notes = body.get("notes");
        MissionAssignment updated = volunteerService.updateAssignmentStatus(assignmentId, status, notes);
        return ResponseEntity.ok(ApiResponse.success("Mission assignment status updated to " + status, updated));
    }
}
