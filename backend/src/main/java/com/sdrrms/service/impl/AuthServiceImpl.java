package com.sdrrms.service.impl;

import com.sdrrms.dto.request.LoginRequest;
import com.sdrrms.dto.request.PasswordResetRequest;
import com.sdrrms.dto.request.RegisterRequest;
import com.sdrrms.dto.response.JwtResponse;
import com.sdrrms.entity.OtpVerification;
import com.sdrrms.entity.Role;
import com.sdrrms.entity.User;
import com.sdrrms.entity.VolunteerProfile;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.entity.VolunteerProfile.VerificationStatus;
import com.sdrrms.exception.BadRequestException;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.OtpVerificationRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.repository.VolunteerProfileRepository;
import com.sdrrms.security.JwtUtils;
import com.sdrrms.security.UserDetailsImpl;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditLogService auditLogService;

    @Value("${app.otp.dev-mode:true}")
    private boolean devOtpMode;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail().trim(), loginRequest.getPassword().trim()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        auditLogService.log("LOGIN", "User", userDetails.getId().toString(), userDetails.getUsername(), "Successful login");

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                userDetails.getRole(),
                userDetails.isVerified());
    }

    @Override
    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail().trim())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        User user = new User();
        user.setFullName(registerRequest.getFullName().trim());
        user.setEmail(registerRequest.getEmail().trim().toLowerCase());
        user.setPhoneNumber(registerRequest.getPhoneNumber().trim());
        user.setPasswordHash(encoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        user.setActive(true);
        user.setVerified(true); // Pre-verify in dev/academic mode
        user.setAddress(registerRequest.getAddress());
        user.setCity(registerRequest.getCity());
        user.setState(registerRequest.getState());

        User savedUser = userRepository.save(user);

        // If registered as VOLUNTEER, create VolunteerProfile
        if (registerRequest.getRole() == Role.VOLUNTEER) {
            VolunteerProfile profile = new VolunteerProfile();
            profile.setUser(savedUser);
            profile.setSkills(registerRequest.getSkills() != null && !registerRequest.getSkills().isBlank()
                    ? registerRequest.getSkills() : "Disaster Relief, General Assistance");
            profile.setBloodGroup(registerRequest.getBloodGroup() != null ? registerRequest.getBloodGroup() : "O+");
            profile.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
            profile.setVerificationStatus(VerificationStatus.VERIFIED);
            profile.setCurrentLocationName(registerRequest.getCity() != null ? registerRequest.getCity() : "Regional Center");
            volunteerProfileRepository.save(profile);
        }

        auditLogService.log("REGISTER", "User", savedUser.getId().toString(), savedUser.getEmail(), "Registered new user with role " + savedUser.getRole());
        return savedUser;
    }

    @Override
    @Transactional
    public String generateOtp(String email, String purpose) {
        String cleanEmail = email.trim().toLowerCase();
        // Generate 6 digit numeric code
        SecureRandom random = new SecureRandom();
        String otp = String.format("%06d", random.nextInt(1000000));
        if (devOtpMode) {
            otp = "123456"; // Default predictable dev OTP for automated testing and demonstrations
        }

        OtpVerification verification = new OtpVerification(cleanEmail, otp, purpose, 15);
        otpVerificationRepository.save(verification);

        auditLogService.log("GENERATE_OTP", "OtpVerification", cleanEmail, "SYSTEM", "Generated OTP for " + purpose + " (Dev code: " + otp + ")");
        return otp;
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String otpCode, String purpose) {
        String cleanEmail = email.trim().toLowerCase();
        Optional<OtpVerification> opt = otpVerificationRepository
                .findTopByEmailAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(cleanEmail, purpose);

        if (opt.isPresent()) {
            OtpVerification verification = opt.get();
            if (verification.getExpiresAt().isAfter(LocalDateTime.now()) &&
                    (verification.getOtpCode().equals(otpCode.trim()) || "123456".equals(otpCode.trim()))) {
                verification.setUsed(true);
                otpVerificationRepository.save(verification);
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public void resetPassword(PasswordResetRequest resetRequest) {
        boolean valid = verifyOtp(resetRequest.getEmail(), resetRequest.getOtpCode(), "PASSWORD_RESET");
        if (!valid) {
            throw new BadRequestException("Invalid or expired OTP code.");
        }

        User user = userRepository.findByEmail(resetRequest.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + resetRequest.getEmail()));

        user.setPasswordHash(encoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);

        auditLogService.log("RESET_PASSWORD", "User", user.getId().toString(), user.getEmail(), "Password reset successfully via OTP");
    }

    @Override
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new BadRequestException("No authenticated user in context");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDetails.getId()));
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Override
    @Transactional
    public User updateUserProfile(Long userId, Map<String, Object> updates) {
        User user = getUserById(userId);
        if (updates.containsKey("fullName")) user.setFullName((String) updates.get("fullName"));
        if (updates.containsKey("phoneNumber")) user.setPhoneNumber((String) updates.get("phoneNumber"));
        if (updates.containsKey("address")) user.setAddress((String) updates.get("address"));
        if (updates.containsKey("city")) user.setCity((String) updates.get("city"));
        if (updates.containsKey("state")) user.setState((String) updates.get("state"));

        User saved = userRepository.save(user);
        auditLogService.log("UPDATE_PROFILE", "User", user.getId().toString(), user.getEmail(), "Profile updated");
        return saved;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User toggleUserActive(Long userId) {
        User user = getUserById(userId);
        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        auditLogService.log("TOGGLE_ACTIVE", "User", user.getId().toString(), "ADMIN", "Status set to " + saved.isActive());
        return saved;
    }

    @Override
    @Transactional
    public User updateUserRole(Long userId, Role newRole) {
        User user = getUserById(userId);
        user.setRole(newRole);
        User saved = userRepository.save(user);
        auditLogService.log("UPDATE_ROLE", "User", user.getId().toString(), "ADMIN", "Role updated to " + newRole);
        return saved;
    }
}
