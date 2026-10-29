package com.sdrrms.repository;

import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.Disaster.DisasterType;
import com.sdrrms.entity.Disaster.Severity;
import com.sdrrms.entity.Disaster.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisasterRepository extends JpaRepository<Disaster, Long> {
    List<Disaster> findByStatus(Status status);
    List<Disaster> findBySeverity(Severity severity);
    long countByStatus(Status status);

    @Query("SELECT d FROM Disaster d WHERE " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:type IS NULL OR d.disasterType = :type) AND " +
           "(:severity IS NULL OR d.severity = :severity) AND " +
           "(:search IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.locationName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Disaster> searchDisasters(@Param("status") Status status,
                                  @Param("type") DisasterType type,
                                  @Param("severity") Severity severity,
                                  @Param("search") String search);
}
