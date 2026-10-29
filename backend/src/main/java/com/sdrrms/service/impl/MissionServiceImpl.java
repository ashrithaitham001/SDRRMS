package com.sdrrms.service.impl;

import com.sdrrms.dto.request.MissionDto;
import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.Mission;
import com.sdrrms.entity.Mission.MissionStatus;
import com.sdrrms.entity.MissionAssignment;
import com.sdrrms.entity.MissionAssignment.AssignmentStatus;
import com.sdrrms.entity.Notification.DeliveryChannel;
import com.sdrrms.entity.Notification.NotificationType;
import com.sdrrms.entity.User;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.*;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.MissionService;
import com.sdrrms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MissionServiceImpl implements MissionService {

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private MissionAssignmentRepository assignmentRepository;

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public List<Mission> getAllMissions(MissionStatus status) {
        if (status != null) {
            return missionRepository.findByStatus(status);
        }
        return missionRepository.findAll();
    }

    @Override
    public Mission getMissionById(Long id) {
        return missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mission not found with id: " + id));
    }

    @Override
    @Transactional
    public Mission createMission(MissionDto dto, Long leadOfficerUserId) {
        User leadOfficer = leadOfficerUserId != null ? userRepository.findById(leadOfficerUserId).orElse(null) : null;
        Disaster disaster = dto.getDisasterId() != null ? disasterRepository.findById(dto.getDisasterId()).orElse(null) : null;

        Mission mission = new Mission();
        mission.setTitle(dto.getTitle());
        mission.setDescription(dto.getDescription());
        mission.setDisaster(disaster);
        mission.setStatus(dto.getStatus() != null ? dto.getStatus() : MissionStatus.PLANNED);
        mission.setLocationName(dto.getLocationName());
        mission.setLatitude(dto.getLatitude());
        mission.setLongitude(dto.getLongitude());
        mission.setTargetBeneficiaries(dto.getTargetBeneficiaries());
        mission.setStartDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDateTime.now());
        mission.setCompletionDate(dto.getCompletionDate());
        mission.setLeadOfficer(leadOfficer);

        Mission saved = missionRepository.save(mission);

        if (dto.getVolunteerIds() != null && !dto.getVolunteerIds().isEmpty()) {
            for (Long volId : dto.getVolunteerIds()) {
                assignVolunteerToMission(saved.getId(), volId, "Initial team deployment", leadOfficerUserId);
            }
        }

        auditLogService.log("CREATE_MISSION", "Mission", saved.getId().toString(),
                leadOfficer != null ? leadOfficer.getEmail() : "SYSTEM", "Created mission: " + saved.getTitle());
        return saved;
    }

    @Override
    @Transactional
    public Mission updateMissionStatus(Long id, MissionStatus status, Long updatedByUserId) {
        Mission mission = getMissionById(id);
        mission.setStatus(status);
        if (status == MissionStatus.COMPLETED) {
            mission.setCompletionDate(LocalDateTime.now());
        }
        Mission saved = missionRepository.save(mission);

        auditLogService.log("UPDATE_MISSION_STATUS", "Mission", saved.getId().toString(),
                userRepository.findById(updatedByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Mission status updated to " + status);
        return saved;
    }

    @Override
    @Transactional
    public MissionAssignment assignVolunteerToMission(Long missionId, Long volunteerId, String notes, Long assignedByUserId) {
        Mission mission = getMissionById(missionId);
        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found: " + volunteerId));

        MissionAssignment assignment = assignmentRepository.findByMissionIdAndVolunteerId(missionId, volunteerId)
                .orElseGet(() -> {
                    MissionAssignment a = new MissionAssignment();
                    a.setMission(mission);
                    a.setVolunteer(volunteer);
                    return a;
                });

        assignment.setStatus(AssignmentStatus.ASSIGNED);
        assignment.setNotes(notes);
        MissionAssignment saved = assignmentRepository.save(assignment);

        volunteerProfileRepository.findByUserId(volunteerId).ifPresent(p -> {
            p.setAvailabilityStatus(AvailabilityStatus.DEPLOYED);
            volunteerProfileRepository.save(p);
        });

        notificationService.sendNotification(volunteer,
                "New Relief Mission: " + mission.getTitle(),
                "You have been assigned to mission: " + mission.getTitle() + " at " + mission.getLocationName(),
                NotificationType.MISSION_ASSIGNMENT, DeliveryChannel.IN_APP, mission.getId().toString());

        auditLogService.log("ASSIGN_MISSION_VOLUNTEER", "MissionAssignment", saved.getId().toString(),
                userRepository.findById(assignedByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Assigned volunteer " + volunteer.getEmail() + " to mission " + mission.getTitle());

        return saved;
    }

    @Override
    public List<MissionAssignment> getMissionAssignments(Long missionId) {
        return assignmentRepository.findByMissionId(missionId);
    }
}
