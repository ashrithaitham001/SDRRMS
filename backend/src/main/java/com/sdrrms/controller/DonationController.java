package com.sdrrms.controller;

import com.sdrrms.dto.request.DonationAllocationDto;
import com.sdrrms.dto.request.DonationDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.Donation;
import com.sdrrms.entity.Donation.DonationStatus;
import com.sdrrms.entity.Donation.DonationType;
import com.sdrrms.entity.DonationAllocation;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuthService;
import com.sdrrms.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/donations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DonationController {

    @Autowired
    private DonationService donationService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Donation>>> getAllDonations(
            @RequestParam(required = false) DonationStatus status,
            @RequestParam(required = false) DonationType type,
            @RequestParam(required = false) String search) {
        List<Donation> donations = donationService.getAllDonations(status, type, search);
        return ResponseEntity.ok(ApiResponse.success("Donations list", donations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Donation>> getDonationById(@PathVariable Long id) {
        Donation donation = donationService.getDonationById(id);
        return ResponseEntity.ok(ApiResponse.success("Donation details", donation));
    }

    @GetMapping("/ref/{ref}")
    public ResponseEntity<ApiResponse<Donation>> getDonationByRef(@PathVariable String ref) {
        Donation donation = donationService.getDonationByRef(ref);
        return ResponseEntity.ok(ApiResponse.success("Donation found by reference", donation));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Donation>> createDonation(@Valid @RequestBody DonationDto dto) {
        User user = null;
        try {
            user = authService.getCurrentUser();
        } catch (Exception ignored) {}

        Donation donation = donationService.createDonation(dto, user != null ? user.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("Donation pledge recorded successfully", donation));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL')")
    public ResponseEntity<ApiResponse<Donation>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUser();
        DonationStatus status = DonationStatus.valueOf(body.get("status"));
        String note = body.get("note");
        Donation updated = donationService.updateDonationStatus(id, status, note, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Donation status updated to " + status, updated));
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL')")
    public ResponseEntity<ApiResponse<DonationAllocation>> allocateDonation(@Valid @RequestBody DonationAllocationDto dto) {
        User user = authService.getCurrentUser();
        DonationAllocation alloc = donationService.allocateDonation(dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Donation allocated successfully", alloc));
    }

    @GetMapping("/allocations/all")
    public ResponseEntity<ApiResponse<List<DonationAllocation>>> getAllAllocations() {
        List<DonationAllocation> allocations = donationService.getAllAllocations();
        return ResponseEntity.ok(ApiResponse.success("All donation allocations", allocations));
    }

    @GetMapping("/{id}/allocations")
    public ResponseEntity<ApiResponse<List<DonationAllocation>>> getDonationAllocations(@PathVariable Long id) {
        List<DonationAllocation> allocations = donationService.getDonationAllocations(id);
        return ResponseEntity.ok(ApiResponse.success("Donation allocations", allocations));
    }

    @GetMapping("/my-donations")
    public ResponseEntity<ApiResponse<List<Donation>>> getMyDonations() {
        User user = authService.getCurrentUser();
        List<Donation> myDonations = donationService.getDonorDonations(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Donor donation history", myDonations));
    }
}
