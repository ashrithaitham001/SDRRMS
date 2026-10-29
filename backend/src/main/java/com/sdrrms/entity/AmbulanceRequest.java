package com.sdrrms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ambulance_requests")
public class AmbulanceRequest {

    public enum Urgency {
        CRITICAL,
        HIGH,
        MEDIUM
    }

    public enum AmbulanceStatus {
        REQUESTED,
        DISPATCHED,
        EN_ROUTE,
        ARRIVED,
        COMPLETED,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "citizen_id")
    private User citizen;

    @Column(nullable = false, length = 120)
    private String patientName;

    @Column(nullable = false, length = 30)
    private String contactPhone;

    @Column(nullable = false)
    private String pickupAddress;

    @Column(precision = 10, scale = 7)
    private BigDecimal pickupLatitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal pickupLongitude;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conditionDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Urgency urgency;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_hospital_id")
    private Hospital assignedHospital;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AmbulanceStatus status = AmbulanceStatus.REQUESTED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime requestedAt;
    private LocalDateTime resolvedAt;

    public AmbulanceRequest() {}

    @PrePersist
    protected void onCreate() {
        if (this.requestedAt == null) {
            this.requestedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }

    public User getCitizen() { return citizen; }
    public void setCitizen(User citizen) { this.citizen = citizen; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public BigDecimal getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(BigDecimal pickupLatitude) { this.pickupLatitude = pickupLatitude; }

    public BigDecimal getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(BigDecimal pickupLongitude) { this.pickupLongitude = pickupLongitude; }

    public String getConditionDescription() { return conditionDescription; }
    public void setConditionDescription(String conditionDescription) { this.conditionDescription = conditionDescription; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }

    public Hospital getAssignedHospital() { return assignedHospital; }
    public void setAssignedHospital(Hospital assignedHospital) { this.assignedHospital = assignedHospital; }

    public AmbulanceStatus getStatus() { return status; }
    public void setStatus(AmbulanceStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
