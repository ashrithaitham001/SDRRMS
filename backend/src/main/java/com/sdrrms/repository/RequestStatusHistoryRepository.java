package com.sdrrms.repository;

import com.sdrrms.entity.RequestStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestStatusHistoryRepository extends JpaRepository<RequestStatusHistory, Long> {
    List<RequestStatusHistory> findByReliefRequestIdOrderByTimestampDesc(Long reliefRequestId);
}
