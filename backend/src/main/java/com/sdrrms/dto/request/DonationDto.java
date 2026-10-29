package com.sdrrms.dto.request;

import com.sdrrms.entity.Donation.DonationStatus;
import com.sdrrms.entity.Donation.DonationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class DonationDto {

    @NotBlank(message = "Donor name is required")
    private String donorName;

    @NotBlank(message = "Donor email is required")
    private String donorEmail;

    private String donorPhone;

    @NotNull(message = "Donation type is required")
    private DonationType donationType;

    private BigDecimal amount = BigDecimal.ZERO;
    private String itemDescription;
    private String itemCategory;
    private int quantity = 0;
    private Long targetDisasterId;
    private DonationStatus status = DonationStatus.PLEDGED;
    private String paymentChannel = "Bank Transfer (Simulated)";
    private String transactionNote;

    public DonationDto() {}

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorEmail() { return donorEmail; }
    public void setDonorEmail(String donorEmail) { this.donorEmail = donorEmail; }

    public String getDonorPhone() { return donorPhone; }
    public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }

    public DonationType getDonationType() { return donationType; }
    public void setDonationType(DonationType donationType) { this.donationType = donationType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }

    public String getItemCategory() { return itemCategory; }
    public void setItemCategory(String itemCategory) { this.itemCategory = itemCategory; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public Long getTargetDisasterId() { return targetDisasterId; }
    public void setTargetDisasterId(Long targetDisasterId) { this.targetDisasterId = targetDisasterId; }

    public DonationStatus getStatus() { return status; }
    public void setStatus(DonationStatus status) { this.status = status; }

    public String getPaymentChannel() { return paymentChannel; }
    public void setPaymentChannel(String paymentChannel) { this.paymentChannel = paymentChannel; }

    public String getTransactionNote() { return transactionNote; }
    public void setTransactionNote(String transactionNote) { this.transactionNote = transactionNote; }
}
