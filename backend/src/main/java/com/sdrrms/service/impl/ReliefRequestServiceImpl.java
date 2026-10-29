package com.sdrrms.service.impl;

import com.sdrrms.dto.request.ReliefRequestDto;
import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.Notification.DeliveryChannel;
import com.sdrrms.entity.Notification.NotificationType;
import com.sdrrms.entity.ReliefRequest;
import com.sdrrms.entity.ReliefRequest.Priority;
import com.sdrrms.entity.ReliefRequest.RequestCategory;
import com.sdrrms.entity.ReliefRequest.RequestStatus;
import com.sdrrms.entity.RequestStatusHistory;
import com.sdrrms.entity.User;
import com.sdrrms.exception.BadRequestException;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.DisasterRepository;
import com.sdrrms.repository.ReliefRequestRepository;
import com.sdrrms.repository.RequestStatusHistoryRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.NotificationService;
import com.sdrrms.service.ReliefRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReliefRequestServiceImpl implements ReliefRequestService {

    @Autowired
    private ReliefRequestRepository reliefRequestRepository;

    @Autowired
    private RequestStatusHistoryRepository historyRepository;

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    private final SecureRandom random = new SecureRandom();

    private String generateTrackingNumber(boolean isSos) {
        String prefix = isSos ? "SOS-" : "REQ-";
        int year = Year.now().getValue();
        int num = 10000 + random.nextInt(90000);
        return prefix + year + "-" + num;
    }

    @Override
    @Transactional
    public ReliefRequest submitRequest(ReliefRequestDto dto, Long citizenUserId) {
        User citizen = citizenUserId != null ? userRepository.findById(citizenUserId).orElse(null) : null;
        Disaster disaster = dto.getDisasterId() != null ? disasterRepository.findById(dto.getDisasterId()).orElse(null) : null;

        ReliefRequest request = new ReliefRequest();
        request.setTrackingNumber(generateTrackingNumber(false));
        request.setCitizen(citizen);
        request.setDisaster(disaster);
        request.setCategory(dto.getCategory());
        request.setPriority(dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM);
        request.setStatus(RequestStatus.SUBMITTED);
        request.setContactName(dto.getContactName());
        request.setContactPhone(dto.getContactPhone());
        request.setLocationAddress(dto.getLocationAddress());
        request.setLatitude(dto.getLatitude());
        request.setLongitude(dto.getLongitude());
        request.setPeopleAffected(dto.getPeopleAffected() > 0 ? dto.getPeopleAffected() : 1);
        request.setDescription(dto.getDescription());
        request.setSos(false);

        ReliefRequest saved = reliefRequestRepository.save(request);

        // Record initial history
        RequestStatusHistory history = new RequestStatusHistory(saved, null, RequestStatus.SUBMITTED, citizen, "Relief request submitted");
        historyRepository.save(history);

        if (citizen != null) {
            notificationService.sendNotification(citizen, "Request Received: " + saved.getTrackingNumber(),
                    "Your relief request for " + saved.getCategory() + " has been received with tracking ID " + saved.getTrackingNumber(),
                    NotificationType.REQUEST_UPDATE, DeliveryChannel.IN_APP, saved.getTrackingNumber());
        }

        auditLogService.log("SUBMIT_REQUEST", "ReliefRequest", saved.getId().toString(),
                citizen != null ? citizen.getEmail() : "ANONYMOUS", "Created request " + saved.getTrackingNumber());
        return saved;
    }

    @Override
    @Transactional
    public ReliefRequest submitSosEmergency(ReliefRequestDto dto, Long citizenUserId) {
        User citizen = citizenUserId != null ? userRepository.findById(citizenUserId).orElse(null) : null;

        ReliefRequest request = new ReliefRequest();
        request.setTrackingNumber(generateTrackingNumber(true));
        request.setCitizen(citizen);
        request.setCategory(dto.getCategory() != null ? dto.getCategory() : RequestCategory.RESCUE);
        request.setPriority(Priority.CRITICAL);
        request.setStatus(RequestStatus.SUBMITTED);
        request.setContactName(dto.getContactName());
        request.setContactPhone(dto.getContactPhone());
        request.setLocationAddress(dto.getLocationAddress());
        request.setLatitude(dto.getLatitude());
        request.setLongitude(dto.getLongitude());
        request.setPeopleAffected(dto.getPeopleAffected() > 0 ? dto.getPeopleAffected() : 1);
        request.setDescription("CRITICAL SOS EMERGENCY: " + dto.getDescription());
        request.setSos(true);

        ReliefRequest saved = reliefRequestRepository.save(request);

        RequestStatusHistory history = new RequestStatusHistory(saved, null, RequestStatus.SUBMITTED, citizen, "CRITICAL SOS Triggered");
        historyRepository.save(history);

        // Alert officials and emergency responders
        notificationService.broadcastEmergencyNotification(
                "CRITICAL SOS ALERT: " + saved.getTrackingNumber(),
                "Immediate emergency rescue requested at " + saved.getLocationAddress() + " (" + saved.getPeopleAffected() + " people affected)",
                saved.getTrackingNumber());

        auditLogService.log("SOS_TRIGGERED", "ReliefRequest", saved.getId().toString(),
                citizen != null ? citizen.getEmail() : "ANONYMOUS", "CRITICAL SOS: " + saved.getTrackingNumber());

        return saved;
    }

    @Override
    public List<ReliefRequest> searchRequests(RequestStatus status, RequestCategory category, Priority priority, Boolean isSos, String search) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return reliefRequestRepository.searchRequests(status, category, priority, isSos, cleanSearch);
    }

    @Override
    public ReliefRequest getRequestById(Long id) {
        return reliefRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Relief request not found with id: " + id));
    }

    @Override
    public ReliefRequest getRequestByTrackingNumber(String trackingNumber) {
        return reliefRequestRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Relief request not found with tracking number: " + trackingNumber));
    }

    @Override
    @Transactional
    public ReliefRequest updateRequestStatus(Long id, RequestStatus newStatus, String remarks, Long changedByUserId) {
        ReliefRequest request = getRequestById(id);
        RequestStatus oldStatus = request.getStatus();

        if (oldStatus == newStatus) {
            return request;
        }

        request.setStatus(newStatus);
        if (remarks != null && !remarks.isBlank()) {
            request.setRemarks(remarks);
        }
        if (newStatus == RequestStatus.RESOLVED) {
            request.setResolvedAt(LocalDateTime.now());
        }

        User changedBy = changedByUserId != null ? userRepository.findById(changedByUserId).orElse(null) : null;
        ReliefRequest saved = reliefRequestRepository.save(request);

        RequestStatusHistory history = new RequestStatusHistory(saved, oldStatus, newStatus, changedBy, remarks);
        historyRepository.save(history);

        if (saved.getCitizen() != null) {
            notificationService.sendNotification(saved.getCitizen(),
                    "Request Update: " + saved.getTrackingNumber(),
                    "Your relief request status is now " + newStatus + (remarks != null ? ". Remarks: " + remarks : ""),
                    NotificationType.REQUEST_UPDATE, DeliveryChannel.IN_APP, saved.getTrackingNumber());
        }

        auditLogService.log("UPDATE_REQUEST_STATUS", "ReliefRequest", saved.getId().toString(),
                changedBy != null ? changedBy.getEmail() : "SYSTEM",
                "Status changed from " + oldStatus + " to " + newStatus);
        return saved;
    }

    @Override
    @Transactional
    public ReliefRequest assignRequest(Long id, Long volunteerId, String ngoName, String remarks, Long assignedByUserId) {
        ReliefRequest request = getRequestById(id);
        User volunteer = null;
        if (volunteerId != null) {
            volunteer = userRepository.findById(volunteerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + volunteerId));
            request.setAssignedVolunteer(volunteer);
        }
        if (ngoName != null && !ngoName.isBlank()) {
            request.setAssignedNgoName(ngoName);
        }

        RequestStatus prevStatus = request.getStatus();
        request.setStatus(RequestStatus.ASSIGNED);
        if (remarks != null) request.setRemarks(remarks);

        ReliefRequest saved = reliefRequestRepository.save(request);
        User assignedBy = assignedByUserId != null ? userRepository.findById(assignedByUserId).orElse(null) : null;

        RequestStatusHistory history = new RequestStatusHistory(saved, prevStatus, RequestStatus.ASSIGNED, assignedBy,
                "Assigned to " + (volunteer != null ? volunteer.getFullName() : ngoName));
        historyRepository.save(history);

        if (volunteer != null) {
            notificationService.sendNotification(volunteer,
                    "New Relief Task Assigned: " + saved.getTrackingNumber(),
                    "You have been assigned relief request at " + saved.getLocationAddress() + " (" + saved.getCategory() + ")",
                    NotificationType.REQUEST_UPDATE, DeliveryChannel.IN_APP, saved.getTrackingNumber());
        }

        auditLogService.log("ASSIGN_REQUEST", "ReliefRequest", saved.getId().toString(),
                assignedBy != null ? assignedBy.getEmail() : "SYSTEM",
                "Assigned to " + (volunteer != null ? volunteer.getEmail() : ngoName));
        return saved;
    }

    @Override
    public List<RequestStatusHistory> getRequestHistory(Long requestId) {
        return historyRepository.findByReliefRequestIdOrderByTimestampDesc(requestId);
    }

    @Override
    public List<ReliefRequest> getCitizenRequests(Long citizenUserId) {
        return reliefRequestRepository.findByCitizenId(citizenUserId);
    }

    @Override
    public List<ReliefRequest> getVolunteerAssignedRequests(Long volunteerUserId) {
        return reliefRequestRepository.findByAssignedVolunteerId(volunteerUserId);
    }

    @Override
    public List<ReliefRequest> getCriticalUnresolvedRequests() {
        return reliefRequestRepository.findByPriority(Priority.CRITICAL)
                .stream()
                .filter(r -> r.getStatus() != RequestStatus.RESOLVED && r.getStatus() != RequestStatus.REJECTED)
                .collect(Collectors.toList());
    }
}
