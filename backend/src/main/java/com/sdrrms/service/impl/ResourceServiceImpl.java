package com.sdrrms.service.impl;

import com.sdrrms.dto.request.ResourceDistributionDto;
import com.sdrrms.dto.request.ResourceDto;
import com.sdrrms.entity.ReliefRequest;
import com.sdrrms.entity.Resource;
import com.sdrrms.entity.Resource.ResourceCategory;
import com.sdrrms.entity.Resource.StockStatus;
import com.sdrrms.entity.ResourceTransaction;
import com.sdrrms.entity.ResourceTransaction.TransactionType;
import com.sdrrms.entity.User;
import com.sdrrms.exception.BadRequestException;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.ReliefRequestRepository;
import com.sdrrms.repository.ResourceRepository;
import com.sdrrms.repository.ResourceTransactionRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class ResourceServiceImpl implements ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ResourceTransactionRepository resourceTransactionRepository;

    @Autowired
    private ReliefRequestRepository reliefRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public List<Resource> getAllResources(ResourceCategory category, StockStatus status, String search) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return resourceRepository.searchResources(category, status, cleanSearch);
    }

    @Override
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    @Override
    @Transactional
    public Resource createResource(ResourceDto dto, Long handledByUserId) {
        Resource resource = new Resource();
        resource.setName(dto.getName());
        resource.setCategory(dto.getCategory());
        resource.setQuantity(dto.getQuantity());
        resource.setUnit(dto.getUnit());
        resource.setMinThreshold(dto.getMinThreshold());
        resource.setStorageLocation(dto.getStorageLocation());
        resource.setLatitude(dto.getLatitude());
        resource.setLongitude(dto.getLongitude());
        resource.setExpiryDate(dto.getExpiryDate());

        Resource saved = resourceRepository.save(resource);

        User handler = userRepository.findById(handledByUserId).orElse(null);
        if (saved.getQuantity() > 0) {
            ResourceTransaction tx = new ResourceTransaction();
            tx.setResource(saved);
            tx.setTransactionType(TransactionType.INCOMING_DONATION);
            tx.setQuantity(saved.getQuantity());
            tx.setRecipientOrSource("Initial Stock Inventory");
            tx.setHandledBy(handler);
            tx.setRemarks("Initial stock entry upon creation");
            resourceTransactionRepository.save(tx);
        }

        auditLogService.log("CREATE_RESOURCE", "Resource", saved.getId().toString(),
                handler != null ? handler.getEmail() : "SYSTEM", "Created resource: " + saved.getName());
        return saved;
    }

    @Override
    @Transactional
    public Resource updateResource(Long id, ResourceDto dto, Long handledByUserId) {
        Resource resource = getResourceById(id);
        int oldQuantity = resource.getQuantity();

        resource.setName(dto.getName());
        resource.setCategory(dto.getCategory());
        resource.setUnit(dto.getUnit());
        resource.setMinThreshold(dto.getMinThreshold());
        resource.setStorageLocation(dto.getStorageLocation());
        resource.setLatitude(dto.getLatitude());
        resource.setLongitude(dto.getLongitude());
        resource.setExpiryDate(dto.getExpiryDate());

        if (dto.getQuantity() != oldQuantity) {
            int diff = dto.getQuantity() - oldQuantity;
            resource.setQuantity(dto.getQuantity());
            User handler = userRepository.findById(handledByUserId).orElse(null);

            ResourceTransaction tx = new ResourceTransaction();
            tx.setResource(resource);
            tx.setTransactionType(TransactionType.ADJUSTMENT);
            tx.setQuantity(Math.abs(diff));
            tx.setRecipientOrSource("Inventory Adjustment");
            tx.setHandledBy(handler);
            tx.setRemarks("Stock adjusted from " + oldQuantity + " to " + dto.getQuantity());
            resourceTransactionRepository.save(tx);
        }

        Resource saved = resourceRepository.save(resource);
        auditLogService.log("UPDATE_RESOURCE", "Resource", saved.getId().toString(),
                userRepository.findById(handledByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Updated resource: " + saved.getName());
        return saved;
    }

    @Override
    @Transactional
    public void deleteResource(Long id, Long handledByUserId) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
        auditLogService.log("DELETE_RESOURCE", "Resource", id.toString(),
                userRepository.findById(handledByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Deleted resource: " + resource.getName());
    }

    @Override
    @Transactional
    public ResourceTransaction processTransaction(Long resourceId, ResourceDistributionDto dto, Long handledByUserId) {
        Resource resource = getResourceById(resourceId);
        User handler = userRepository.findById(handledByUserId).orElse(null);

        if (dto.getTransactionType() == TransactionType.OUTGOING_DISTRIBUTION) {
            if (resource.getQuantity() < dto.getQuantity()) {
                throw new BadRequestException("Insufficient inventory! Available: " + resource.getQuantity()
                        + " " + resource.getUnit() + ", Requested: " + dto.getQuantity());
            }
            resource.setQuantity(resource.getQuantity() - dto.getQuantity());
        } else if (dto.getTransactionType() == TransactionType.INCOMING_DONATION ||
                   dto.getTransactionType() == TransactionType.RETURN) {
            resource.setQuantity(resource.getQuantity() + dto.getQuantity());
        }

        resourceRepository.save(resource);

        ReliefRequest request = null;
        if (dto.getRelatedRequestId() != null) {
            request = reliefRequestRepository.findById(dto.getRelatedRequestId()).orElse(null);
        }

        ResourceTransaction tx = new ResourceTransaction();
        tx.setResource(resource);
        tx.setTransactionType(dto.getTransactionType());
        tx.setQuantity(dto.getQuantity());
        tx.setRecipientOrSource(dto.getRecipientOrSource());
        tx.setRelatedRequest(request);
        tx.setHandledBy(handler);
        tx.setRemarks(dto.getRemarks());

        ResourceTransaction savedTx = resourceTransactionRepository.save(tx);
        auditLogService.log("RESOURCE_TRANSACTION", "ResourceTransaction", savedTx.getId().toString(),
                handler != null ? handler.getEmail() : "SYSTEM",
                dto.getTransactionType() + " of " + dto.getQuantity() + " " + resource.getUnit() + " for " + dto.getRecipientOrSource());

        return savedTx;
    }

    @Override
    public List<ResourceTransaction> getResourceTransactions(Long resourceId) {
        return resourceTransactionRepository.findByResourceIdOrderByTimestampDesc(resourceId);
    }

    @Override
    public List<ResourceTransaction> getAllTransactions() {
        return resourceTransactionRepository.findAllByOrderByTimestampDesc();
    }

    @Override
    public List<Resource> getLowStockResources() {
        return resourceRepository.findByStatusIn(Arrays.asList(StockStatus.LOW_STOCK, StockStatus.OUT_OF_STOCK));
    }
}
