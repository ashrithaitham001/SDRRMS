package com.sdrrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class DonationAllocationDto {

    @NotNull(message = "Donation ID is required")
    private Long donationId;

    @NotBlank(message = "Allocation target is required")
    private String allocatedTo;

    private BigDecimal amountAllocated = BigDecimal.ZERO;
    private int quantityAllocated = 0;
    private String notes;

    public DonationAllocationDto() {}

    public Long getDonationId() { return donationId; }
    public void setDonationId(Long donationId) { this.donationId = donationId; }

    public String getAllocatedTo() { return allocatedTo; }
    public void setAllocatedTo(String allocatedTo) { this.allocatedTo = allocatedTo; }

    public BigDecimal getAmountAllocated() { return amountAllocated; }
    public void setAmountAllocated(BigDecimal amountAllocated) { this.amountAllocated = amountAllocated; }

    public int getQuantityAllocated() { return quantityAllocated; }
    public void setQuantityAllocated(int quantityAllocated) { this.quantityAllocated = quantityAllocated; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
