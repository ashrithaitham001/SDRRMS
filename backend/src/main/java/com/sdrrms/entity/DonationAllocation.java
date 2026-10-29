package com.sdrrms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_allocations")
public class DonationAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @Column(nullable = false)
    private String allocatedTo;

    @Column(precision = 12, scale = 2)
    private BigDecimal amountAllocated = BigDecimal.ZERO;

    private int quantityAllocated = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_by_user_id")
    private User allocatedBy;

    private LocalDateTime allocationDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public DonationAllocation() {}

    @PrePersist
    protected void onCreate() {
        if (this.allocationDate == null) {
            this.allocationDate = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Donation getDonation() { return donation; }
    public void setDonation(Donation donation) { this.donation = donation; }

    public String getAllocatedTo() { return allocatedTo; }
    public void setAllocatedTo(String allocatedTo) { this.allocatedTo = allocatedTo; }

    public BigDecimal getAmountAllocated() { return amountAllocated; }
    public void setAmountAllocated(BigDecimal amountAllocated) { this.amountAllocated = amountAllocated; }

    public int getQuantityAllocated() { return quantityAllocated; }
    public void setQuantityAllocated(int quantityAllocated) { this.quantityAllocated = quantityAllocated; }

    public User getAllocatedBy() { return allocatedBy; }
    public void setAllocatedBy(User allocatedBy) { this.allocatedBy = allocatedBy; }

    public LocalDateTime getAllocationDate() { return allocationDate; }
    public void setAllocationDate(LocalDateTime allocationDate) { this.allocationDate = allocationDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
