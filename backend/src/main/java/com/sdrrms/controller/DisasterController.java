package com.sdrrms.controller;

import com.sdrrms.dto.request.DisasterDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.Disaster.DisasterType;
import com.sdrrms.entity.Disaster.Severity;
import com.sdrrms.entity.Disaster.Status;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuthService;
import com.sdrrms.service.DisasterService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/disasters")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DisasterController {

    @Autowired
    private DisasterService disasterService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Disaster>>> getAllDisasters(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) DisasterType type,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) String search) {
        List<Disaster> disasters = disasterService.getAllDisasters(status, type, severity, search);
        return ResponseEntity.ok(ApiResponse.success("Disasters list", disasters));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Disaster>> getDisasterById(@PathVariable Long id) {
        Disaster disaster = disasterService.getDisasterById(id);
        return ResponseEntity.ok(ApiResponse.success("Disaster details", disaster));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL')")
    public ResponseEntity<ApiResponse<Disaster>> createDisaster(@Valid @RequestBody DisasterDto dto) {
        User user = authService.getCurrentUser();
        Disaster created = disasterService.createDisaster(dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Disaster incident registered successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL')")
    public ResponseEntity<ApiResponse<Disaster>> updateDisaster(@PathVariable Long id, @Valid @RequestBody DisasterDto dto) {
        User user = authService.getCurrentUser();
        Disaster updated = disasterService.updateDisaster(id, dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Disaster incident updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDisaster(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        disasterService.deleteDisaster(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Disaster incident removed successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Disaster>>> getActiveDisasters() {
        List<Disaster> active = disasterService.getActiveDisasters();
        return ResponseEntity.ok(ApiResponse.success("Active disasters", active));
    }
}
