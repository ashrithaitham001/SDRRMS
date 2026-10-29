package com.sdrrms.controller;

import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.AuditLog;
import com.sdrrms.entity.Role;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = authService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All registered users", users));
    }

    @PutMapping("/users/{userId}/toggle-active")
    public ResponseEntity<ApiResponse<User>> toggleUserActive(@PathVariable Long userId) {
        User updated = authService.toggleUserActive(userId);
        return ResponseEntity.ok(ApiResponse.success("User active state changed to " + updated.isActive(), updated));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        Role newRole = Role.valueOf(body.get("role"));
        User updated = authService.updateUserRole(userId, newRole);
        return ResponseEntity.ok(ApiResponse.success("User role updated to " + newRole, updated));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = auditLogService.getAllLogs();
        return ResponseEntity.ok(ApiResponse.success("System security & operational audit logs", logs));
    }
}
