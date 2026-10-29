package com.sdrrms.dto.request;

import com.sdrrms.entity.Mission.MissionStatus;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class MissionDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private Long disasterId;
    private MissionStatus status = MissionStatus.PLANNED;

    @NotBlank(message = "Location name is required")
    private String locationName;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private int targetBeneficiaries = 0;
    private LocalDateTime startDate;
    private LocalDateTime completionDate;
    private List<Long> volunteerIds;

    public MissionDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getDisasterId() { return disasterId; }
    public void setDisasterId(Long disasterId) { this.disasterId = disasterId; }

    public MissionStatus getStatus() { return status; }
    public void setStatus(MissionStatus status) { this.status = status; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public int getTargetBeneficiaries() { return targetBeneficiaries; }
    public void setTargetBeneficiaries(int targetBeneficiaries) { this.targetBeneficiaries = targetBeneficiaries; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDateTime completionDate) { this.completionDate = completionDate; }

    public List<Long> getVolunteerIds() { return volunteerIds; }
    public void setVolunteerIds(List<Long> volunteerIds) { this.volunteerIds = volunteerIds; }
}
