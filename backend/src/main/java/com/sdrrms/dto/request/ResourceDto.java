package com.sdrrms.dto.request;

import com.sdrrms.entity.Resource.ResourceCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ResourceDto {

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Category is required")
    private ResourceCategory category;

    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @Min(value = 0, message = "Threshold cannot be negative")
    private int minThreshold = 50;

    @NotBlank(message = "Storage location is required")
    private String storageLocation;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDate expiryDate;

    public ResourceDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ResourceCategory getCategory() { return category; }
    public void setCategory(ResourceCategory category) { this.category = category; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public int getMinThreshold() { return minThreshold; }
    public void setMinThreshold(int minThreshold) { this.minThreshold = minThreshold; }

    public String getStorageLocation() { return storageLocation; }
    public void setStorageLocation(String storageLocation) { this.storageLocation = storageLocation; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
