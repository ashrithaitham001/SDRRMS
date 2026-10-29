package com.sdrrms.controller;

import com.sdrrms.dto.request.AmbulanceRequestDto;
import com.sdrrms.dto.request.HospitalDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.AmbulanceRequest;
import com.sdrrms.entity.AmbulanceRequest.AmbulanceStatus;
import com.sdrrms.entity.Hospital;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuthService;
import com.sdrrms.service.MedicalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hospitals")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MedicalController {

    @Autowired
    private MedicalService medicalService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Hospital>>> getAllHospitals(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String search) {
        List<Hospital> hospitals = medicalService.getAllHospitals(city, search);
        return ResponseEntity.ok(ApiResponse.success("Hospital directory", hospitals));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Hospital>> getHospitalById(@PathVariable Long id) {
        Hospital hospital = medicalService.getHospitalById(id);
        return ResponseEntity.ok(ApiResponse.success("Hospital details", hospital));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'HOSPITAL_REP')")
    public ResponseEntity<ApiResponse<Hospital>> createHospital(@Valid @RequestBody HospitalDto dto) {
        User user = authService.getCurrentUser();
        Hospital created = medicalService.createHospital(dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Hospital registered successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'HOSPITAL_REP')")
    public ResponseEntity<ApiResponse<Hospital>> updateHospital(@PathVariable Long id, @Valid @RequestBody HospitalDto dto) {
        User user = authService.getCurrentUser();
        Hospital updated = medicalService.updateHospital(id, dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Hospital details updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHospital(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        medicalService.deleteHospital(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Hospital removed successfully"));
    }

    // Ambulance requests
    @PostMapping("/ambulance/request")
    public ResponseEntity<ApiResponse<AmbulanceRequest>> requestAmbulance(@Valid @RequestBody AmbulanceRequestDto dto) {
        User user = null;
        try {
            user = authService.getCurrentUser();
        } catch (Exception ignored) {}

        AmbulanceRequest req = medicalService.requestAmbulance(dto, user != null ? user.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("Ambulance dispatched request received", req));
    }

    @GetMapping("/ambulance/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'HOSPITAL_REP', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<AmbulanceRequest>>> getAllAmbulanceRequests() {
        List<AmbulanceRequest> list = medicalService.getAllAmbulanceRequests();
        return ResponseEntity.ok(ApiResponse.success("All ambulance emergency requests", list));
    }

    @GetMapping("/ambulance/my-requests")
    public ResponseEntity<ApiResponse<List<AmbulanceRequest>>> getMyAmbulanceRequests() {
        User user = authService.getCurrentUser();
        List<AmbulanceRequest> list = medicalService.getCitizenAmbulanceRequests(user.getId());
        return ResponseEntity.ok(ApiResponse.success("My ambulance requests", list));
    }

    @PutMapping("/ambulance/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'HOSPITAL_REP')")
    public ResponseEntity<ApiResponse<AmbulanceRequest>> updateAmbulanceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User user = authService.getCurrentUser();
        AmbulanceStatus status = AmbulanceStatus.valueOf(body.get("status").toString());
        Long hospitalId = body.get("hospitalId") != null ? Long.valueOf(body.get("hospitalId").toString()) : null;
        String notes = (String) body.get("notes");

        AmbulanceRequest updated = medicalService.updateAmbulanceStatus(id, status, hospitalId, notes, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Ambulance status updated to " + status, updated));
    }
}
