package com.sdrrms.service;

import com.sdrrms.dto.request.LoginRequest;
import com.sdrrms.dto.request.PasswordResetRequest;
import com.sdrrms.dto.request.RegisterRequest;
import com.sdrrms.dto.response.JwtResponse;
import com.sdrrms.entity.Role;
import com.sdrrms.entity.User;

import java.util.List;
import java.util.Map;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    User registerUser(RegisterRequest registerRequest);
    String generateOtp(String email, String purpose);
    boolean verifyOtp(String email, String otpCode, String purpose);
    void resetPassword(PasswordResetRequest resetRequest);
    User getCurrentUser();
    User getUserById(Long userId);
    User updateUserProfile(Long userId, Map<String, Object> updates);
    List<User> getAllUsers();
    User toggleUserActive(Long userId);
    User updateUserRole(Long userId, Role newRole);
}
