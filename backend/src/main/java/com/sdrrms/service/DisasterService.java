package com.sdrrms.service;

import com.sdrrms.dto.request.DisasterDto;
import com.sdrrms.entity.Disaster;
import com.sdrrms.entity.Disaster.DisasterType;
import com.sdrrms.entity.Disaster.Severity;
import com.sdrrms.entity.Disaster.Status;

import java.util.List;

public interface DisasterService {
    List<Disaster> getAllDisasters(Status status, DisasterType type, Severity severity, String search);
    Disaster getDisasterById(Long id);
    Disaster createDisaster(DisasterDto dto, Long reportedByUserId);
    Disaster updateDisaster(Long id, DisasterDto dto, Long updatedByUserId);
    void deleteDisaster(Long id, Long deletedByUserId);
    List<Disaster> getActiveDisasters();
}
