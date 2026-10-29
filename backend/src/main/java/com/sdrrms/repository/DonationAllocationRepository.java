package com.sdrrms.repository;

import com.sdrrms.entity.DonationAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationAllocationRepository extends JpaRepository<DonationAllocation, Long> {
    List<DonationAllocation> findByDonationId(Long donationId);
    List<DonationAllocation> findAllByOrderByAllocationDateDesc();
}
