package com.sdrrms.dto.request;

import com.sdrrms.entity.Disaster.DisasterType;
import com.sdrrms.entity.Disaster.Severity;
import com.sdrrms.entity.Disaster.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DisasterDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Disaster type is required")
    private DisasterType disasterType;

    @NotNull(message = "Severity is required")
    private Severity severity;

    private Status status = Status.ACTIVE;

    @NotBlank(message = "Location name is required")
    private String locationName;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    private BigDecimal affectedRadiusKm = new BigDecimal("10.0");
    private int estimatedAffectedPeople = 0;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public DisasterDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DisasterType getDisasterType() { return disasterType; }
    public void setDisasterType(DisasterType disasterType) { this.disasterType = disasterType; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public BigDecimal getAffectedRadiusKm() { return affectedRadiusKm; }
    public void setAffectedRadiusKm(BigDecimal affectedRadiusKm) { this.affectedRadiusKm = affectedRadiusKm; }

    public int getEstimatedAffectedPeople() { return estimatedAffectedPeople; }
    public void setEstimatedAffectedPeople(int estimatedAffectedPeople) { this.estimatedAffectedPeople = estimatedAffectedPeople; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
}
