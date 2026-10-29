package com.sdrrms.repository;

import com.sdrrms.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByCityIgnoreCase(String city);

    @Query("SELECT h FROM Hospital h WHERE " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:search IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.availableServices) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Hospital> searchHospitals(@Param("city") String city, @Param("search") String search);
}
