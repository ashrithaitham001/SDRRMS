package com.sdrrms.service.impl;

import com.sdrrms.dto.request.VolunteerProfileDto;
import com.sdrrms.entity.MissionAssignment;
import com.sdrrms.entity.MissionAssignment.AssignmentStatus;
import com.sdrrms.entity.User;
import com.sdrrms.entity.VolunteerProfile;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.entity.VolunteerProfile.VerificationStatus;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.MissionAssignmentRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.repository.VolunteerProfileRepository;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VolunteerServiceImpl implements VolunteerService {

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MissionAssignmentRepository missionAssignmentRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public List<VolunteerProfile> getAllVolunteers(AvailabilityStatus status, VerificationStatus verification, String search) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return volunteerProfileRepository.searchVolunteers(status, verification, cleanSearch);
    }

    @Override
    public VolunteerProfile getVolunteerProfileByUserId(Long userId) {
        return volunteerProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    VolunteerProfile profile = new VolunteerProfile();
                    profile.setUser(user);
                    profile.setSkills("First Aid, Logistics");
                    profile.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                    profile.setVerificationStatus(VerificationStatus.VERIFIED);
                    return volunteerProfileRepository.save(profile);
                });
    }

    @Override
    @Transactional
    public VolunteerProfile updateVolunteerProfile(Long userId, VolunteerProfileDto dto) {
        VolunteerProfile profile = getVolunteerProfileByUserId(userId);
        if (dto.getSkills() != null) profile.setSkills(dto.getSkills());
        if (dto.getAvailabilityStatus() != null) profile.setAvailabilityStatus(dto.getAvailabilityStatus());
        if (dto.getCurrentLatitude() != null) profile.setCurrentLatitude(dto.getCurrentLatitude());
        if (dto.getCurrentLongitude() != null) profile.setCurrentLongitude(dto.getCurrentLongitude());
        if (dto.getCurrentLocationName() != null) profile.setCurrentLocationName(dto.getCurrentLocationName());
        if (dto.getBloodGroup() != null) profile.setBloodGroup(dto.getBloodGroup());
        if (dto.getVerificationStatus() != null) profile.setVerificationStatus(dto.getVerificationStatus());

        VolunteerProfile saved = volunteerProfileRepository.save(profile);
        auditLogService.log("UPDATE_VOLUNTEER_PROFILE", "VolunteerProfile", saved.getId().toString(), profile.getUser().getEmail(), "Volunteer profile updated");
        return saved;
    }

    @Override
    @Transactional
    public VolunteerProfile verifyVolunteer(Long volunteerProfileId, VerificationStatus status, Long verifierUserId) {
        VolunteerProfile profile = volunteerProfileRepository.findById(volunteerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found: " + volunteerProfileId));
        User verifier = userRepository.findById(verifierUserId).orElse(null);

        profile.setVerificationStatus(status);
        profile.setVerifiedBy(verifier);
        VolunteerSaved(profile);

        auditLogService.log("VERIFY_VOLUNTEER", "VolunteerProfile", profile.getId().toString(),
                verifier != null ? verifier.getEmail() : "SYSTEM", "Status updated to " + status);
        return profile;
    }

    private void VolunteerSaved(VolunteerProfile profile) {
        volunteerProfileRepository.save(profile);
    }

    @Override
    public List<MissionAssignment> getVolunteerAssignments(Long userId) {
        return missionAssignmentRepository.findByVolunteerId(userId);
    }

    @Override
    @Transactional
    public MissionAssignment updateAssignmentStatus(Long assignmentId, AssignmentStatus status, String notes) {
        MissionAssignment assignment = missionAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Mission assignment not found: " + assignmentId));

        assignment.setStatus(status);
        if (notes != null) assignment.setNotes(notes);

        if (status == AssignmentStatus.COMPLETED) {
            assignment.setCompletedAt(LocalDateTime.now());
            // Update volunteer total missions completed
            volunteerProfileRepository.findByUserId(assignment.getVolunteer().getId()).ifPresent(p -> {
                p.setTotalMissionsCompleted(p.getTotalMissionsCompleted() + 1);
                p.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                volunteerProfileRepository.save(p);
            });
        } else if (status == AssignmentStatus.IN_PROGRESS || status == AssignmentStatus.ACCEPTED) {
            volunteerProfileRepository.findByUserId(assignment.getVolunteer().getId()).ifPresent(p -> {
                p.setAvailabilityStatus(AvailabilityStatus.DEPLOYED);
                volunteerProfileRepository.save(p);
            });
        }

        MissionAssignment saved = missionAssignmentRepository.save(assignment);
        auditLogService.log("UPDATE_ASSIGNMENT_STATUS", "MissionAssignment", saved.getId().toString(),
                assignment.getVolunteer().getEmail(), "Mission assignment status set to " + status);
        return saved;
    }
}
