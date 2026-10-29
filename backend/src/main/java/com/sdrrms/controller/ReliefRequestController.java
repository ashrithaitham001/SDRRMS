package com.sdrrms.controller;

import com.sdrrms.dto.request.ReliefRequestDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.ReliefRequest;
import com.sdrrms.entity.ReliefRequest.Priority;
import com.sdrrms.entity.ReliefRequest.RequestCategory;
import com.sdrrms.entity.ReliefRequest.RequestStatus;
import com.sdrrms.entity.RequestStatusHistory;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuthService;
import com.sdrrms.service.ReliefRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReliefRequestController {

    @Autowired
    private ReliefRequestService reliefRequestService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReliefRequest>>> searchRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) RequestCategory category,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Boolean isSos,
            @RequestParam(required = false) String search) {
        List<ReliefRequest> requests = reliefRequestService.searchRequests(status, category, priority, isSos, search);
        return ResponseEntity.ok(ApiResponse.success("Relief requests list", requests));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReliefRequest>> getRequestById(@PathVariable Long id) {
        ReliefRequest request = reliefRequestService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.success("Relief request details", request));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ApiResponse<ReliefRequest>> getRequestByTrackingNumber(@PathVariable String trackingNumber) {
        ReliefRequest request = reliefRequestService.getRequestByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(ApiResponse.success("Tracked relief request", request));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReliefRequest>> submitRequest(@Valid @RequestBody ReliefRequestDto dto) {
        User user = authService.getCurrentUser();
        ReliefRequest request = reliefRequestService.submitRequest(dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Relief request submitted successfully", request));
    }

    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<ReliefRequest>> submitSosEmergency(@RequestBody ReliefRequestDto dto) {
        User user = null;
        try {
            user = authService.getCurrentUser();
        } catch (Exception ignored) {}

        ReliefRequest request = reliefRequestService.submitSosEmergency(dto, user != null ? user.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("EMERGENCY SOS REGISTERED! Responders notified.", request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ReliefRequest>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUser();
        RequestStatus newStatus = RequestStatus.valueOf(body.get("status"));
        String remarks = body.get("remarks");

        ReliefRequest updated = reliefRequestService.updateRequestStatus(id, newStatus, remarks, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + newStatus, updated));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<ReliefRequest>> assignRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User user = authService.getCurrentUser();
        Long volunteerId = body.get("volunteerId") != null ? Long.valueOf(body.get("volunteerId").toString()) : null;
        String ngoName = (String) body.get("ngoName");
        String remarks = (String) body.get("remarks");

        ReliefRequest assigned = reliefRequestService.assignRequest(id, volunteerId, ngoName, remarks, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Request assigned successfully", assigned));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<RequestStatusHistory>>> getRequestHistory(@PathVariable Long id) {
        List<RequestStatusHistory> history = reliefRequestService.getRequestHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Request status timeline history", history));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<ReliefRequest>>> getMyRequests() {
        User user = authService.getCurrentUser();
        List<ReliefRequest> myRequests = reliefRequestService.getCitizenRequests(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Citizen submitted requests", myRequests));
    }

    @GetMapping("/assigned-to-me")
    public ResponseEntity<ApiResponse<List<ReliefRequest>>> getAssignedToMe() {
        User user = authService.getCurrentUser();
        List<ReliefRequest> assigned = reliefRequestService.getVolunteerAssignedRequests(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Volunteer assigned requests", assigned));
    }

    @GetMapping("/critical")
    public ResponseEntity<ApiResponse<List<ReliefRequest>>> getCriticalRequests() {
        List<ReliefRequest> critical = reliefRequestService.getCriticalUnresolvedRequests();
        return ResponseEntity.ok(ApiResponse.success("Critical unresolved relief requests", critical));
    }
}
