package com.sdrrms.dto.request;

import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.entity.VolunteerProfile.VerificationStatus;

import java.math.BigDecimal;

public class VolunteerProfileDto {

    private String skills;
    private AvailabilityStatus availabilityStatus;
    private BigDecimal currentLatitude;
    private BigDecimal currentLongitude;
    private String currentLocationName;
    private String bloodGroup;
    private VerificationStatus verificationStatus;

    public VolunteerProfileDto() {}

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public AvailabilityStatus getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public BigDecimal getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(BigDecimal currentLatitude) { this.currentLatitude = currentLatitude; }

    public BigDecimal getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(BigDecimal currentLongitude) { this.currentLongitude = currentLongitude; }

    public String getCurrentLocationName() { return currentLocationName; }
    public void setCurrentLocationName(String currentLocationName) { this.currentLocationName = currentLocationName; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
}
