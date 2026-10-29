package com.sdrrms.repository;

import com.sdrrms.entity.Resource;
import com.sdrrms.entity.Resource.ResourceCategory;
import com.sdrrms.entity.Resource.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCategory(ResourceCategory category);
    List<Resource> findByStatus(StockStatus status);
    List<Resource> findByStatusIn(List<StockStatus> statuses);
    long countByStatus(StockStatus status);

    @Query("SELECT r FROM Resource r WHERE " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.storageLocation) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Resource> searchResources(@Param("category") ResourceCategory category,
                                   @Param("status") StockStatus status,
                                   @Param("search") String search);
}
