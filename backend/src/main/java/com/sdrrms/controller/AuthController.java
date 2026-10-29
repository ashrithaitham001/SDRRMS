package com.sdrrms.controller;

import com.sdrrms.dto.request.LoginRequest;
import com.sdrrms.dto.request.OtpVerificationRequest;
import com.sdrrms.dto.request.PasswordResetRequest;
import com.sdrrms.dto.request.RegisterRequest;
import com.sdrrms.dto.response.ApiResponse;
import com.sdrrms.dto.response.JwtResponse;
import com.sdrrms.entity.User;
import com.sdrrms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", jwtResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = authService.registerUser(registerRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully. You may now log in.", user));
    }

    @PostMapping("/otp/request")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestOtp(@RequestParam String email,
                                                                      @RequestParam(defaultValue = "PASSWORD_RESET") String purpose) {
        String otp = authService.generateOtp(email, purpose);
        Map<String, String> res = new HashMap<>();
        res.put("email", email);
        res.put("purpose", purpose);
        res.put("devOtp", otp); // Development mode visibility for testing
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully. (Dev-code available in response)", res));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        boolean valid = authService.verifyOtp(request.getEmail(), request.getOtpCode(), request.getPurpose());
        if (valid) {
            return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP"));
        }
    }

    @PostMapping("/password-reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. Please log in with your new password."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Current user profile", user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(@RequestBody Map<String, Object> updates) {
        User currentUser = authService.getCurrentUser();
        User updated = authService.updateUserProfile(currentUser.getId(), updates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
