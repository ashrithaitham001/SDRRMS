package com.sdrrms.controller;

import com.sdrrms.dto.request.ResourceDistributionDto;
import com.sdrrms.dto.request.ResourceDto;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.Resource;
import com.sdrrms.entity.Resource.ResourceCategory;
import com.sdrrms.entity.Resource.StockStatus;
import com.sdrrms.entity.ResourceTransaction;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuthService;
import com.sdrrms.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Resource>>> getAllResources(
            @RequestParam(required = false) ResourceCategory category,
            @RequestParam(required = false) StockStatus status,
            @RequestParam(required = false) String search) {
        List<Resource> resources = resourceService.getAllResources(category, status, search);
        return ResponseEntity.ok(ApiResponse.success("Resource inventory list", resources));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Resource>> getResourceById(@PathVariable Long id) {
        Resource resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success("Resource details", resource));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'NGO_REPRESENTATIVE')")
    public ResponseEntity<ApiResponse<Resource>> createResource(@Valid @RequestBody ResourceDto dto) {
        User user = authService.getCurrentUser();
        Resource created = resourceService.createResource(dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Resource created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'NGO_REPRESENTATIVE')")
    public ResponseEntity<ApiResponse<Resource>> updateResource(@PathVariable Long id, @Valid @RequestBody ResourceDto dto) {
        User user = authService.getCurrentUser();
        Resource updated = resourceService.updateResource(id, dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        resourceService.deleteResource(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully"));
    }

    @PostMapping("/{id}/distribute")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_OFFICIAL', 'NGO_REPRESENTATIVE', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<ResourceTransaction>> distributeResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceDistributionDto dto) {
        User user = authService.getCurrentUser();
        ResourceTransaction tx = resourceService.processTransaction(id, dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Resource distribution processed successfully", tx));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<ApiResponse<List<ResourceTransaction>>> getResourceTransactions(@PathVariable Long id) {
        List<ResourceTransaction> transactions = resourceService.getResourceTransactions(id);
        return ResponseEntity.ok(ApiResponse.success("Resource transaction history", transactions));
    }

    @GetMapping("/transactions/all")
    public ResponseEntity<ApiResponse<List<ResourceTransaction>>> getAllTransactions() {
        List<ResourceTransaction> transactions = resourceService.getAllTransactions();
        return ResponseEntity.ok(ApiResponse.success("All resource transactions", transactions));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<Resource>>> getLowStockResources() {
        List<Resource> lowStock = resourceService.getLowStockResources();
        return ResponseEntity.ok(ApiResponse.success("Low stock and depleted resources", lowStock));
    }
}
