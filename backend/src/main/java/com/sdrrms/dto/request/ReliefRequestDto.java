package com.sdrrms.dto.request;

import com.sdrrms.entity.ReliefRequest.Priority;
import com.sdrrms.entity.ReliefRequest.RequestCategory;
import com.sdrrms.entity.ReliefRequest.RequestStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ReliefRequestDto {

    private Long disasterId;

    @NotNull(message = "Category is required")
    private RequestCategory category;

    @NotNull(message = "Priority is required")
    private Priority priority = Priority.MEDIUM;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    @NotBlank(message = "Location address is required")
    private String locationAddress;

    private BigDecimal latitude;
    private BigDecimal longitude;

    private int peopleAffected = 1;

    @NotBlank(message = "Description is required")
    private String description;

    private boolean isSos = false;

    // For updates / assignment
    private RequestStatus status;
    private Long assignedVolunteerId;
    private String assignedNgoName;
    private String remarks;

    public ReliefRequestDto() {}

    public Long getDisasterId() { return disasterId; }
    public void setDisasterId(Long disasterId) { this.disasterId = disasterId; }

    public RequestCategory getCategory() { return category; }
    public void setCategory(RequestCategory category) { this.category = category; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public int getPeopleAffected() { return peopleAffected; }
    public void setPeopleAffected(int peopleAffected) { this.peopleAffected = peopleAffected; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isSos() { return isSos; }
    public void setSos(boolean sos) { isSos = sos; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public Long getAssignedVolunteerId() { return assignedVolunteerId; }
    public void setAssignedVolunteerId(Long assignedVolunteerId) { this.assignedVolunteerId = assignedVolunteerId; }

    public String getAssignedNgoName() { return assignedNgoName; }
    public void setAssignedNgoName(String assignedNgoName) { this.assignedNgoName = assignedNgoName; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
