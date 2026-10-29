package com.sdrrms.repository;

import com.sdrrms.entity.Mission;
import com.sdrrms.entity.Mission.MissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByStatus(MissionStatus status);
    List<Mission> findByDisasterId(Long disasterId);
    List<Mission> findByLeadOfficerId(Long leadOfficerId);
    long countByStatus(MissionStatus status);
}
