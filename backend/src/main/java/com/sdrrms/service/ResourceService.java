package com.sdrrms.service;

import com.sdrrms.dto.request.ResourceDistributionDto;
import com.sdrrms.dto.request.ResourceDto;
import com.sdrrms.entity.Resource;
import com.sdrrms.entity.Resource.ResourceCategory;
import com.sdrrms.entity.Resource.StockStatus;
import com.sdrrms.entity.ResourceTransaction;

import java.util.List;

public interface ResourceService {
    List<Resource> getAllResources(ResourceCategory category, StockStatus status, String search);
    Resource getResourceById(Long id);
    Resource createResource(ResourceDto dto, Long handledByUserId);
    Resource updateResource(Long id, ResourceDto dto, Long handledByUserId);
    void deleteResource(Long id, Long handledByUserId);
    ResourceTransaction processTransaction(Long resourceId, ResourceDistributionDto dto, Long handledByUserId);
    List<ResourceTransaction> getResourceTransactions(Long resourceId);
    List<ResourceTransaction> getAllTransactions();
    List<Resource> getLowStockResources();
}
