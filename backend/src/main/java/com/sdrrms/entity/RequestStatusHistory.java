package com.sdrrms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "request_status_history")
public class RequestStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relief_request_id", nullable = false)
    private ReliefRequest reliefRequest;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private ReliefRequest.RequestStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ReliefRequest.RequestStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id")
    private User changedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private LocalDateTime timestamp;

    public RequestStatusHistory() {}

    public RequestStatusHistory(ReliefRequest reliefRequest, ReliefRequest.RequestStatus previousStatus,
                                ReliefRequest.RequestStatus newStatus, User changedBy, String remarks) {
        this.reliefRequest = reliefRequest;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.remarks = remarks;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ReliefRequest getReliefRequest() { return reliefRequest; }
    public void setReliefRequest(ReliefRequest reliefRequest) { this.reliefRequest = reliefRequest; }

    public ReliefRequest.RequestStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(ReliefRequest.RequestStatus previousStatus) { this.previousStatus = previousStatus; }

    public ReliefRequest.RequestStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ReliefRequest.RequestStatus newStatus) { this.newStatus = newStatus; }

    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
