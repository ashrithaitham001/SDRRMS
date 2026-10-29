package com.sdrrms.service.impl;

import com.sdrrms.dto.request.DonationAllocationDto;
import com.sdrrms.dto.request.DonationDto;
import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.Donation;
import com.sdrrms.entity.Donation.DonationStatus;
import com.sdrrms.entity.Donation.DonationType;
import com.sdrrms.entity.DonationAllocation;
import com.sdrrms.entity.Notification.DeliveryChannel;
import com.sdrrms.entity.Notification.NotificationType;
import com.sdrrms.entity.User;
import com.sdrrms.exception.BadRequestException;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.DisasterRepository;
import com.sdrrms.repository.DonationAllocationRepository;
import com.sdrrms.repository.DonationRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.DonationService;
import com.sdrrms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
public class DonationServiceImpl implements DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private DonationAllocationRepository allocationRepository;

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    private final SecureRandom random = new SecureRandom();

    private String generateDonationRef() {
        int year = Year.now().getValue();
        int num = 1000 + random.nextInt(9000);
        return "DON-" + year + "-" + num;
    }

    @Override
    @Transactional
    public Donation createDonation(DonationDto dto, Long donorUserId) {
        User donor = donorUserId != null ? userRepository.findById(donorUserId).orElse(null) : null;
        Disaster disaster = dto.getTargetDisasterId() != null ? disasterRepository.findById(dto.getTargetDisasterId()).orElse(null) : null;

        Donation donation = new Donation();
        donation.setDonationRef(generateDonationRef());
        donation.setDonor(donor);
        donation.setDonorName(dto.getDonorName());
        donation.setDonorEmail(dto.getDonorEmail());
        donation.setDonorPhone(dto.getDonorPhone());
        donation.setDonationType(dto.getDonationType());
        donation.setAmount(dto.getAmount() != null ? dto.getAmount() : BigDecimal.ZERO);
        donation.setItemDescription(dto.getItemDescription());
        donation.setItemCategory(dto.getItemCategory());
        donation.setQuantity(dto.getQuantity());
        donation.setTargetDisaster(disaster);
        donation.setStatus(dto.getStatus() != null ? dto.getStatus() : DonationStatus.PLEDGED);
        donation.setPaymentChannel(dto.getPaymentChannel() != null ? dto.getPaymentChannel() : "Bank Transfer (Simulated)");
        donation.setTransactionNote(dto.getTransactionNote());
        donation.setDonationDate(LocalDateTime.now());

        Donation saved = donationRepository.save(donation);

        if (donor != null) {
            notificationService.sendNotification(donor,
                    "Donation Recorded: " + saved.getDonationRef(),
                    "Thank you for your generous relief contribution (Ref: " + saved.getDonationRef() + "). Current status: " + saved.getStatus(),
                    NotificationType.DONATION_CONFIRMED, DeliveryChannel.IN_APP, saved.getDonationRef());
        }

        auditLogService.log("CREATE_DONATION", "Donation", saved.getId().toString(),
                donor != null ? donor.getEmail() : saved.getDonorEmail(),
                "Registered donation " + saved.getDonationRef() + " of type " + saved.getDonationType());
        return saved;
    }

    @Override
    public List<Donation> getAllDonations(DonationStatus status, DonationType type, String search) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return donationRepository.searchDonations(status, type, cleanSearch);
    }

    @Override
    public Donation getDonationById(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
    }

    @Override
    public Donation getDonationByRef(String donationRef) {
        return donationRepository.findByDonationRef(donationRef)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with reference: " + donationRef));
    }

    @Override
    @Transactional
    public Donation updateDonationStatus(Long id, DonationStatus status, String note, Long handledByUserId) {
        Donation donation = getDonationById(id);
        donation.setStatus(status);
        if (note != null) donation.setTransactionNote(note);

        Donation saved = donationRepository.save(donation);

        if (saved.getDonor() != null) {
            notificationService.sendNotification(saved.getDonor(),
                    "Donation Status Updated: " + saved.getDonationRef(),
                    "Your contribution status has been updated to: " + status,
                    NotificationType.DONATION_CONFIRMED, DeliveryChannel.IN_APP, saved.getDonationRef());
        }

        auditLogService.log("UPDATE_DONATION_STATUS", "Donation", saved.getId().toString(),
                userRepository.findById(handledByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Status set to " + status);
        return saved;
    }

    @Override
    @Transactional
    public DonationAllocation allocateDonation(DonationAllocationDto dto, Long allocatedByUserId) {
        Donation donation = getDonationById(dto.getDonationId());
        User allocator = allocatedByUserId != null ? userRepository.findById(allocatedByUserId).orElse(null) : null;

        if (donation.getStatus() == DonationStatus.REJECTED) {
            throw new BadRequestException("Cannot allocate a rejected donation.");
        }

        DonationAllocation alloc = new DonationAllocation();
        alloc.setDonation(donation);
        alloc.setAllocatedTo(dto.getAllocatedTo());
        alloc.setAmountAllocated(dto.getAmountAllocated() != null ? dto.getAmountAllocated() : BigDecimal.ZERO);
        alloc.setQuantityAllocated(dto.getQuantityAllocated());
        alloc.setAllocatedBy(allocator);
        alloc.setNotes(dto.getNotes());
        alloc.setAllocationDate(LocalDateTime.now());

        DonationAllocation savedAlloc = allocationRepository.save(alloc);

        donation.setStatus(DonationStatus.ALLOCATED);
        donationRepository.save(donation);

        auditLogService.log("ALLOCATE_DONATION", "DonationAllocation", savedAlloc.getId().toString(),
                allocator != null ? allocator.getEmail() : "SYSTEM",
                "Allocated donation " + donation.getDonationRef() + " to " + dto.getAllocatedTo());

        return savedAlloc;
    }

    @Override
    public List<DonationAllocation> getAllAllocations() {
        return allocationRepository.findAllByOrderByAllocationDateDesc();
    }

    @Override
    public List<DonationAllocation> getDonationAllocations(Long donationId) {
        return allocationRepository.findByDonationId(donationId);
    }

    @Override
    public List<Donation> getDonorDonations(Long donorUserId) {
        return donationRepository.findByDonorId(donorUserId);
    }
}
