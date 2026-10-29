package com.sdrrms.service.impl;

import com.sdrrms.entity.AuditLog;
import com.sdrrms.repository.AuditLogRepository;
import com.sdrrms.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    public void log(String action, String entityName, String entityId, String performedBy, String details) {
        try {
            AuditLog log = new AuditLog(action, entityName, entityId, performedBy, details);
            auditLogRepository.save(log);
        } catch (Exception ignored) {}
    }

    @Override
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
