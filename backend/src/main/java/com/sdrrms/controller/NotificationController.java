package com.sdrrms.controller;

import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.entity.Notification;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuthService;
import com.sdrrms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getUserNotifications() {
        User user = authService.getCurrentUser();
        List<Notification> list = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success("User notifications", list));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications() {
        User user = authService.getCurrentUser();
        List<Notification> unread = notificationService.getUnreadNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread notifications", unread));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = authService.getCurrentUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
