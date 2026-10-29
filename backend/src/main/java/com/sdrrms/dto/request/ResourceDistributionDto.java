package com.sdrrms.dto.request;

import com.sdrrms.entity.ResourceTransaction.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ResourceDistributionDto {

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;

    @NotBlank(message = "Recipient or source is required")
    private String recipientOrSource;

    private Long relatedRequestId;
    private String remarks;

    public ResourceDistributionDto() {}

    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getRecipientOrSource() { return recipientOrSource; }
    public void setRecipientOrSource(String recipientOrSource) { this.recipientOrSource = recipientOrSource; }

    public Long getRelatedRequestId() { return relatedRequestId; }
    public void setRelatedRequestId(Long relatedRequestId) { this.relatedRequestId = relatedRequestId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
