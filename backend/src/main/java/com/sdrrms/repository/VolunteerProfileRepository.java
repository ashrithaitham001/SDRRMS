package com.sdrrms.repository;

import com.sdrrms.entity.VolunteerProfile;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.entity.VolunteerProfile.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerProfileRepository extends JpaRepository<VolunteerProfile, Long> {
    Optional<VolunteerProfile> findByUserId(Long userId);
    List<VolunteerProfile> findByAvailabilityStatus(AvailabilityStatus status);
    List<VolunteerProfile> findByVerificationStatus(VerificationStatus status);
    long countByAvailabilityStatus(AvailabilityStatus status);
    long countByVerificationStatus(VerificationStatus status);

    @Query("SELECT v FROM VolunteerProfile v WHERE " +
           "(:status IS NULL OR v.availabilityStatus = :status) AND " +
           "(:verification IS NULL OR v.verificationStatus = :verification) AND " +
           "(:search IS NULL OR LOWER(v.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.skills) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.currentLocationName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<VolunteerProfile> searchVolunteers(@Param("status") AvailabilityStatus status,
                                           @Param("verification") VerificationStatus verification,
                                           @Param("search") String search);
}
