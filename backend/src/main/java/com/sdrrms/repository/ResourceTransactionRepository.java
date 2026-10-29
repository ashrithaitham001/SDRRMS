package com.sdrrms.repository;

import com.sdrrms.entity.ResourceTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceTransactionRepository extends JpaRepository<ResourceTransaction, Long> {
    List<ResourceTransaction> findByResourceIdOrderByTimestampDesc(Long resourceId);
    List<ResourceTransaction> findAllByOrderByTimestampDesc();
}
