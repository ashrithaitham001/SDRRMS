package com.sdrrms.dto.response;

import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.EmergencyAlert;
import com.sdrrms.entity.ReliefRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {

    private long totalActiveDisasters;
    private long totalPendingRequests;
    private long totalCriticalRequests;
    private long totalSosRequests;
    private long availableVolunteers;
    private long totalVolunteers;
    private long activeMissions;
    private long totalResources;
    private long lowStockResources;
    private BigDecimal totalDonationsReceived;
    private long activeAlerts;

    // Chart aggregations
    private Map<String, Long> requestsByCategory;
    private Map<String, Long> requestsByStatus;
    private Map<String, Long> requestsByPriority;
    private Map<String, Long> resourcesByCategory;
    private Map<String, Long> donationsByStatus;

    // Recent items
    private List<ReliefRequest> recentRequests;
    private List<EmergencyAlert> recentAlerts;
    private List<Disaster> activeDisasters;

    public DashboardStatsResponse() {}

    public long getTotalActiveDisasters() { return totalActiveDisasters; }
    public void setTotalActiveDisasters(long totalActiveDisasters) { this.totalActiveDisasters = totalActiveDisasters; }

    public long getTotalPendingRequests() { return totalPendingRequests; }
    public void setTotalPendingRequests(long totalPendingRequests) { this.totalPendingRequests = totalPendingRequests; }

    public long getTotalCriticalRequests() { return totalCriticalRequests; }
    public void setTotalCriticalRequests(long totalCriticalRequests) { this.totalCriticalRequests = totalCriticalRequests; }

    public long getTotalSosRequests() { return totalSosRequests; }
    public void setTotalSosRequests(long totalSosRequests) { this.totalSosRequests = totalSosRequests; }

    public long getAvailableVolunteers() { return availableVolunteers; }
    public void setAvailableVolunteers(long availableVolunteers) { this.availableVolunteers = availableVolunteers; }

    public long getTotalVolunteers() { return totalVolunteers; }
    public void setTotalVolunteers(long totalVolunteers) { this.totalVolunteers = totalVolunteers; }

    public long getActiveMissions() { return activeMissions; }
    public void setActiveMissions(long activeMissions) { this.activeMissions = activeMissions; }

    public long getTotalResources() { return totalResources; }
    public void setTotalResources(long totalResources) { this.totalResources = totalResources; }

    public long getLowStockResources() { return lowStockResources; }
    public void setLowStockResources(long lowStockResources) { this.lowStockResources = lowStockResources; }

    public BigDecimal getTotalDonationsReceived() { return totalDonationsReceived; }
    public void setTotalDonationsReceived(BigDecimal totalDonationsReceived) { this.totalDonationsReceived = totalDonationsReceived; }

    public long getActiveAlerts() { return activeAlerts; }
    public void setActiveAlerts(long activeAlerts) { this.activeAlerts = activeAlerts; }

    public Map<String, Long> getRequestsByCategory() { return requestsByCategory; }
    public void setRequestsByCategory(Map<String, Long> requestsByCategory) { this.requestsByCategory = requestsByCategory; }

    public Map<String, Long> getRequestsByStatus() { return requestsByStatus; }
    public void setRequestsByStatus(Map<String, Long> requestsByStatus) { this.requestsByStatus = requestsByStatus; }

    public Map<String, Long> getRequestsByPriority() { return requestsByPriority; }
    public void setRequestsByPriority(Map<String, Long> requestsByPriority) { this.requestsByPriority = requestsByPriority; }

    public Map<String, Long> getResourcesByCategory() { return resourcesByCategory; }
    public void setResourcesByCategory(Map<String, Long> resourcesByCategory) { this.resourcesByCategory = resourcesByCategory; }

    public Map<String, Long> getDonationsByStatus() { return donationsByStatus; }
    public void setDonationsByStatus(Map<String, Long> donationsByStatus) { this.donationsByStatus = donationsByStatus; }

    public List<ReliefRequest> getRecentRequests() { return recentRequests; }
    public void setRecentRequests(List<ReliefRequest> recentRequests) { this.recentRequests = recentRequests; }

    public List<EmergencyAlert> getRecentAlerts() { return recentAlerts; }
    public void setRecentAlerts(List<EmergencyAlert> recentAlerts) { this.recentAlerts = recentAlerts; }

    public List<Disaster> getActiveDisasters() { return activeDisasters; }
    public void setActiveDisasters(List<Disaster> activeDisasters) { this.activeDisasters = activeDisasters; }
}
