package com.sdrrms.repository;

import com.sdrrms.entity.MissionAssignment;
import com.sdrrms.entity.MissionAssignment.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MissionAssignmentRepository extends JpaRepository<MissionAssignment, Long> {
    List<MissionAssignment> findByMissionId(Long missionId);
    List<MissionAssignment> findByVolunteerId(Long volunteerId);
    Optional<MissionAssignment> findByMissionIdAndVolunteerId(Long missionId, Long volunteerId);
    List<MissionAssignment> findByVolunteerIdAndStatus(Long volunteerId, AssignmentStatus status);
}
