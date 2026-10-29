package com.sdrrms.repository;

import com.sdrrms.entity.EmergencyAlert;
import com.sdrrms.entity.EmergencyAlert.AlertSeverity;
import com.sdrrms.entity.EmergencyAlert.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, Long> {
    List<EmergencyAlert> findByStatusOrderByPublishedAtDesc(AlertStatus status);
    List<EmergencyAlert> findAllByOrderByPublishedAtDesc();
    long countByStatus(AlertStatus status);

    @Query("SELECT a FROM EmergencyAlert a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:severity IS NULL OR a.severity = :severity) AND " +
           "(:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.affectedArea) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.message) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.publishedAt DESC")
    List<EmergencyAlert> searchAlerts(@Param("status") AlertStatus status,
                                      @Param("severity") AlertSeverity severity,
                                      @Param("search") String search);
}
