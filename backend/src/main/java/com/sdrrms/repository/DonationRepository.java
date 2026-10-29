package com.sdrrms.repository;

import com.sdrrms.entity.Donation;
import com.sdrrms.entity.Donation.DonationStatus;
import com.sdrrms.entity.Donation.DonationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    Optional<Donation> findByDonationRef(String donationRef);
    List<Donation> findByDonorId(Long donorId);
    List<Donation> findByStatus(DonationStatus status);
    List<Donation> findByDonationType(DonationType type);
    long countByStatus(DonationStatus status);

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d WHERE d.donationType = 'MONETARY' AND d.status IN ('RECEIVED', 'ALLOCATED')")
    BigDecimal getTotalMonetaryDonationsReceived();

    @Query("SELECT d FROM Donation d WHERE " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:type IS NULL OR d.donationType = :type) AND " +
           "(:search IS NULL OR LOWER(d.donationRef) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.donorName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.donorEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Donation> searchDonations(@Param("status") DonationStatus status,
                                   @Param("type") DonationType type,
                                   @Param("search") String search);
}
