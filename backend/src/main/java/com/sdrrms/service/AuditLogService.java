package com.sdrrms.service;

import com.sdrrms.entity.AuditLog;
import java.util.List;

public interface AuditLogService {
    void log(String action, String entityName, String entityId, String performedBy, String details);
    List<AuditLog> getAllLogs();
}
