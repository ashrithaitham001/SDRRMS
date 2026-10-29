package com.sdrrms.service;

import com.sdrrms.dto.request.ReliefRequestDto;
import com.sdrrms.entity.ReliefRequest;
import com.sdrrms.entity.ReliefRequest.Priority;
import com.sdrrms.entity.ReliefRequest.RequestCategory;
import com.sdrrms.entity.ReliefRequest.RequestStatus;
import com.sdrrms.entity.RequestStatusHistory;

import java.util.List;

public interface ReliefRequestService {
    ReliefRequest submitRequest(ReliefRequestDto dto, Long citizenUserId);
    ReliefRequest submitSosEmergency(ReliefRequestDto dto, Long citizenUserId);
    List<ReliefRequest> searchRequests(RequestStatus status, RequestCategory category, Priority priority, Boolean isSos, String search);
    ReliefRequest getRequestById(Long id);
    ReliefRequest getRequestByTrackingNumber(String trackingNumber);
    ReliefRequest updateRequestStatus(Long id, RequestStatus newStatus, String remarks, Long changedByUserId);
    ReliefRequest assignRequest(Long id, Long volunteerId, String ngoName, String remarks, Long assignedByUserId);
    List<RequestStatusHistory> getRequestHistory(Long requestId);
    List<ReliefRequest> getCitizenRequests(Long citizenUserId);
    List<ReliefRequest> getVolunteerAssignedRequests(Long volunteerUserId);
    List<ReliefRequest> getCriticalUnresolvedRequests();
}
