package com.sdrrms.service.impl;

import com.sdrrms.dto.response.DashboardStatsResponse;
import com.sdrrms.entity.*;
import com.sdrrms.entity.Disaster.Status;
import com.sdrrms.entity.Donation.DonationStatus;
import com.sdrrms.entity.EmergencyAlert.AlertStatus;
import com.sdrrms.entity.Mission.MissionStatus;
import com.sdrrms.entity.ReliefRequest.Priority;
import com.sdrrms.entity.ReliefRequest.RequestStatus;
import com.sdrrms.entity.Resource.StockStatus;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.repository.*;
import com.sdrrms.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private ReliefRequestRepository reliefRequestRepository;

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private EmergencyAlertRepository emergencyAlertRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalActiveDisasters(disasterRepository.countByStatus(Status.ACTIVE));
        stats.setTotalPendingRequests(reliefRequestRepository.countByStatus(RequestStatus.SUBMITTED)
                + reliefRequestRepository.countByStatus(RequestStatus.VERIFIED));
        stats.setTotalCriticalRequests(reliefRequestRepository.countByPriority(Priority.CRITICAL));
        stats.setTotalSosRequests(reliefRequestRepository.countByIsSosTrue());
        stats.setAvailableVolunteers(volunteerProfileRepository.countByAvailabilityStatus(AvailabilityStatus.AVAILABLE));
        stats.setTotalVolunteers(volunteerProfileRepository.count());
        stats.setActiveMissions(missionRepository.countByStatus(MissionStatus.IN_PROGRESS)
                + missionRepository.countByStatus(MissionStatus.ASSIGNED));
        stats.setTotalResources(resourceRepository.count());
        stats.setLowStockResources(resourceRepository.countByStatus(StockStatus.LOW_STOCK)
                + resourceRepository.countByStatus(StockStatus.OUT_OF_STOCK));

        BigDecimal donations = donationRepository.getTotalMonetaryDonationsReceived();
        stats.setTotalDonationsReceived(donations != null ? donations : BigDecimal.ZERO);
        stats.setActiveAlerts(emergencyAlertRepository.countByStatus(AlertStatus.ACTIVE));

        // Groupings for charts
        List<ReliefRequest> allRequests = reliefRequestRepository.findAll();

        Map<String, Long> requestsByCategory = allRequests.stream()
                .collect(Collectors.groupingBy(r -> r.getCategory().name(), Collectors.counting()));
        stats.setRequestsByCategory(requestsByCategory);

        Map<String, Long> requestsByStatus = allRequests.stream()
                .collect(Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting()));
        stats.setRequestsByStatus(requestsByStatus);

        Map<String, Long> requestsByPriority = allRequests.stream()
                .collect(Collectors.groupingBy(r -> r.getPriority().name(), Collectors.counting()));
        stats.setRequestsByPriority(requestsByPriority);

        List<Resource> allResources = resourceRepository.findAll();
        Map<String, Long> resourcesByCategory = allResources.stream()
                .collect(Collectors.groupingBy(r -> r.getCategory().name(), Collectors.counting()));
        stats.setResourcesByCategory(resourcesByCategory);

        List<Donation> allDonations = donationRepository.findAll();
        Map<String, Long> donationsByStatus = allDonations.stream()
                .collect(Collectors.groupingBy(d -> d.getStatus().name(), Collectors.counting()));
        stats.setDonationsByStatus(donationsByStatus);

        // Recent items
        stats.setRecentRequests(allRequests.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(6)
                .collect(Collectors.toList()));

        stats.setRecentAlerts(emergencyAlertRepository.findAllByOrderByPublishedAtDesc().stream()
                .limit(5)
                .collect(Collectors.toList()));

        stats.setActiveDisasters(disasterRepository.findByStatus(Status.ACTIVE));

        return stats;
    }
}
