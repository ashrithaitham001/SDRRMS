package com.sdrrms.repository;

import com.sdrrms.entity.ReliefRequest;
import com.sdrrms.entity.ReliefRequest.Priority;
import com.sdrrms.entity.ReliefRequest.RequestCategory;
import com.sdrrms.entity.ReliefRequest.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReliefRequestRepository extends JpaRepository<ReliefRequest, Long> {
    Optional<ReliefRequest> findByTrackingNumber(String trackingNumber);
    List<ReliefRequest> findByCitizenId(Long citizenId);
    List<ReliefRequest> findByAssignedVolunteerId(Long volunteerId);
    List<ReliefRequest> findByDisasterId(Long disasterId);
    List<ReliefRequest> findByStatus(RequestStatus status);
    List<ReliefRequest> findByPriority(Priority priority);
    List<ReliefRequest> findByIsSosTrue();

    long countByStatus(RequestStatus status);
    long countByPriority(Priority priority);
    long countByIsSosTrue();
    long countByCategory(RequestCategory category);

    @Query("SELECT r FROM ReliefRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:priority IS NULL OR r.priority = :priority) AND " +
           "(:isSos IS NULL OR r.isSos = :isSos) AND " +
           "(:search IS NULL OR LOWER(r.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.contactName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.locationAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<ReliefRequest> searchRequests(@Param("status") RequestStatus status,
                                      @Param("category") RequestCategory category,
                                      @Param("priority") Priority priority,
                                      @Param("isSos") Boolean isSos,
                                      @Param("search") String search);
}
