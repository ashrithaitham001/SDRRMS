package com.sdrrms.service.impl;

import com.sdrrms.dto.request.DisasterDto;
import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.Disaster.DisasterType;
import com.sdrrms.entity.Disaster.Severity;
import com.sdrrms.entity.Disaster.Status;
import com.sdrrms.entity.User;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.DisasterRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.DisasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DisasterServiceImpl implements DisasterService {

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public List<Disaster> getAllDisasters(Status status, DisasterType type, Severity severity, String search) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return disasterRepository.searchDisasters(status, type, severity, cleanSearch);
    }

    @Override
    public Disaster getDisasterById(Long id) {
        return disasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disaster not found with id: " + id));
    }

    @Override
    @Transactional
    public Disaster createDisaster(DisasterDto dto, Long reportedByUserId) {
        User user = reportedByUserId != null ? userRepository.findById(reportedByUserId).orElse(null) : null;

        Disaster disaster = new Disaster();
        disaster.setTitle(dto.getTitle());
        disaster.setDescription(dto.getDescription());
        disaster.setDisasterType(dto.getDisasterType());
        disaster.setSeverity(dto.getSeverity());
        disaster.setStatus(dto.getStatus() != null ? dto.getStatus() : Status.ACTIVE);
        disaster.setLocationName(dto.getLocationName());
        disaster.setLatitude(dto.getLatitude());
        disaster.setLongitude(dto.getLongitude());
        if (dto.getAffectedRadiusKm() != null) disaster.setAffectedRadiusKm(dto.getAffectedRadiusKm());
        disaster.setEstimatedAffectedPeople(dto.getEstimatedAffectedPeople());
        disaster.setReportedBy(user);
        if (dto.getStartDate() != null) disaster.setStartDate(dto.getStartDate());
        disaster.setEndDate(dto.getEndDate());

        Disaster saved = disasterRepository.save(disaster);
        auditLogService.log("CREATE_DISASTER", "Disaster", saved.getId().toString(),
                user != null ? user.getEmail() : "SYSTEM", "Registered disaster: " + saved.getTitle());
        return saved;
    }

    @Override
    @Transactional
    public Disaster updateDisaster(Long id, DisasterDto dto, Long updatedByUserId) {
        Disaster disaster = getDisasterById(id);
        disaster.setTitle(dto.getTitle());
        disaster.setDescription(dto.getDescription());
        disaster.setDisasterType(dto.getDisasterType());
        disaster.setSeverity(dto.getSeverity());
        if (dto.getStatus() != null) disaster.setStatus(dto.getStatus());
        disaster.setLocationName(dto.getLocationName());
        disaster.setLatitude(dto.getLatitude());
        disaster.setLongitude(dto.getLongitude());
        if (dto.getAffectedRadiusKm() != null) disaster.setAffectedRadiusKm(dto.getAffectedRadiusKm());
        disaster.setEstimatedAffectedPeople(dto.getEstimatedAffectedPeople());
        if (dto.getStartDate() != null) disaster.setStartDate(dto.getStartDate());
        disaster.setEndDate(dto.getEndDate());

        Disaster saved = disasterRepository.save(disaster);
        auditLogService.log("UPDATE_DISASTER", "Disaster", saved.getId().toString(),
                userRepository.findById(updatedByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Updated disaster: " + saved.getTitle());
        return saved;
    }

    @Override
    @Transactional
    public void deleteDisaster(Long id, Long deletedByUserId) {
        Disaster disaster = getDisasterById(id);
        disasterRepository.delete(disaster);
        auditLogService.log("DELETE_DISASTER", "Disaster", id.toString(),
                userRepository.findById(deletedByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Deleted disaster: " + disaster.getTitle());
    }

    @Override
    public List<Disaster> getActiveDisasters() {
        return disasterRepository.findByStatus(Status.ACTIVE);
    }
}
