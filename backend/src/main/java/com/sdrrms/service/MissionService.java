package com.sdrrms.service;

import com.sdrrms.dto.request.MissionDto;
import com.sdrrms.entity.Mission;
import com.sdrrms.entity.Mission.MissionStatus;
import com.sdrrms.entity.MissionAssignment;

import java.util.List;

public interface MissionService {
    List<Mission> getAllMissions(MissionStatus status);
    Mission getMissionById(Long id);
    Mission createMission(MissionDto dto, Long leadOfficerUserId);
    Mission updateMissionStatus(Long id, MissionStatus status, Long updatedByUserId);
    MissionAssignment assignVolunteerToMission(Long missionId, Long volunteerId, String notes, Long assignedByUserId);
    List<MissionAssignment> getMissionAssignments(Long missionId);
}
