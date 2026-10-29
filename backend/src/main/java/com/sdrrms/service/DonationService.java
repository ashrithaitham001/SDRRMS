package com.sdrrms.service;

import com.sdrrms.dto.request.DonationAllocationDto;
import com.sdrrms.dto.request.DonationDto;
import com.sdrrms.entity.Donation;
import com.sdrrms.entity.Donation.DonationStatus;
import com.sdrrms.entity.Donation.DonationType;
import com.sdrrms.entity.DonationAllocation;

import java.util.List;

public interface DonationService {
    Donation createDonation(DonationDto dto, Long donorUserId);
    List<Donation> getAllDonations(DonationStatus status, DonationType type, String search);
    Donation getDonationById(Long id);
    Donation getDonationByRef(String donationRef);
    Donation updateDonationStatus(Long id, DonationStatus status, String note, Long handledByUserId);
    DonationAllocation allocateDonation(DonationAllocationDto dto, Long allocatedByUserId);
    List<DonationAllocation> getAllAllocations();
    List<DonationAllocation> getDonationAllocations(Long donationId);
    List<Donation> getDonorDonations(Long donorUserId);
}
