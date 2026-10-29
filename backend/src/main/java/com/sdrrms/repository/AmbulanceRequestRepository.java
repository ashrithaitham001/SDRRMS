package com.sdrrms.repository;

import com.sdrrms.entity.AmbulanceRequest;
import com.sdrrms.entity.AmbulanceRequest.AmbulanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmbulanceRequestRepository extends JpaRepository<AmbulanceRequest, Long> {
    Optional<AmbulanceRequest> findByRequestNumber(String requestNumber);
    List<AmbulanceRequest> findByCitizenId(Long citizenId);
    List<AmbulanceRequest> findByAssignedHospitalId(Long hospitalId);
    List<AmbulanceRequest> findByStatus(AmbulanceStatus status);
    long countByStatus(AmbulanceStatus status);
}
