package com.sdrrms.service;

import com.sdrrms.dto.request.VolunteerProfileDto;
import com.sdrrms.entity.MissionAssignment;
import com.sdrrms.entity.MissionAssignment.AssignmentStatus;
import com.sdrrms.entity.VolunteerProfile;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.entity.VolunteerProfile.VerificationStatus;

import java.util.List;

public interface VolunteerService {
    List<VolunteerProfile> getAllVolunteers(AvailabilityStatus status, VerificationStatus verification, String search);
    VolunteerProfile getVolunteerProfileByUserId(Long userId);
    VolunteerProfile updateVolunteerProfile(Long userId, VolunteerProfileDto dto);
    VolunteerProfile verifyVolunteer(Long volunteerProfileId, VerificationStatus status, Long verifierUserId);
    List<MissionAssignment> getVolunteerAssignments(Long userId);
    MissionAssignment updateAssignmentStatus(Long assignmentId, AssignmentStatus status, String notes);
}
