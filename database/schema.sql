-- ====================================================================
-- Smart Disaster Relief Resource Management System (SDRRMS)
-- Database Schema for MySQL 8.0+
-- ====================================================================

CREATE DATABASE IF NOT EXISTS sdrrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sdrrms_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(40) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Volunteer Profiles Table
CREATE TABLE IF NOT EXISTS volunteer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    skills TEXT NOT NULL,
    availability_status VARCHAR(40) NOT NULL DEFAULT 'AVAILABLE',
    current_latitude DECIMAL(10, 7),
    current_longitude DECIMAL(10, 7),
    current_location_name VARCHAR(255),
    blood_group VARCHAR(10),
    verification_status VARCHAR(40) NOT NULL DEFAULT 'VERIFIED',
    verified_by_user_id BIGINT,
    total_missions_completed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_volunteers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_volunteers_verifier FOREIGN KEY (verified_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_volunteers_availability (availability_status)
) ENGINE=InnoDB;

-- 3. Disasters Table
CREATE TABLE IF NOT EXISTS disasters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    disaster_type VARCHAR(50) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    affected_radius_km DECIMAL(6, 2) NOT NULL DEFAULT 10.0,
    estimated_affected_people INT NOT NULL DEFAULT 0,
    reported_by_user_id BIGINT,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_disasters_reporter FOREIGN KEY (reported_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_disasters_status (status),
    INDEX idx_disasters_severity (severity)
) ENGINE=InnoDB;

-- 4. Relief Requests Table
CREATE TABLE IF NOT EXISTS relief_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    citizen_id BIGINT,
    disaster_id BIGINT,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(30) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'SUBMITTED',
    contact_name VARCHAR(120) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    location_address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    people_affected INT NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    assigned_volunteer_id BIGINT,
    assigned_ngo_name VARCHAR(150),
    is_sos BOOLEAN NOT NULL DEFAULT FALSE,
    remarks TEXT,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_citizen FOREIGN KEY (citizen_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_requests_disaster FOREIGN KEY (disaster_id) REFERENCES disasters (id) ON DELETE SET NULL,
    CONSTRAINT fk_requests_volunteer FOREIGN KEY (assigned_volunteer_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_requests_tracking (tracking_number),
    INDEX idx_requests_status (status),
    INDEX idx_requests_priority (priority),
    INDEX idx_requests_category (category)
) ENGINE=InnoDB;

-- 5. Request Status History Table
CREATE TABLE IF NOT EXISTS request_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    relief_request_id BIGINT NOT NULL,
    previous_status VARCHAR(40),
    new_status VARCHAR(40) NOT NULL,
    changed_by_user_id BIGINT,
    remarks TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_request FOREIGN KEY (relief_request_id) REFERENCES relief_requests (id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Resources Inventory Table
CREATE TABLE IF NOT EXISTS resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(40) NOT NULL,
    min_threshold INT NOT NULL DEFAULT 50,
    storage_location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    expiry_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_resources_category (category),
    INDEX idx_resources_status (status)
) ENGINE=InnoDB;

-- 7. Resource Transactions Table
CREATE TABLE IF NOT EXISTS resource_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    transaction_type VARCHAR(40) NOT NULL,
    quantity INT NOT NULL,
    recipient_or_source VARCHAR(255) NOT NULL,
    related_request_id BIGINT,
    handled_by_user_id BIGINT,
    remarks TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trans_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
    CONSTRAINT fk_trans_request FOREIGN KEY (related_request_id) REFERENCES relief_requests (id) ON DELETE SET NULL,
    CONSTRAINT fk_trans_handler FOREIGN KEY (handled_by_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Relief Missions Table
CREATE TABLE IF NOT EXISTS missions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    disaster_id BIGINT,
    status VARCHAR(40) NOT NULL DEFAULT 'PLANNED',
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    target_beneficiaries INT NOT NULL DEFAULT 0,
    start_date DATETIME,
    completion_date DATETIME,
    lead_officer_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_missions_disaster FOREIGN KEY (disaster_id) REFERENCES disasters (id) ON DELETE SET NULL,
    CONSTRAINT fk_missions_lead FOREIGN KEY (lead_officer_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Mission Assignments Table
CREATE TABLE IF NOT EXISTS mission_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mission_id BIGINT NOT NULL,
    volunteer_id BIGINT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    notes TEXT,
    CONSTRAINT fk_assign_mission FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_volunteer FOREIGN KEY (volunteer_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_ref VARCHAR(50) NOT NULL UNIQUE,
    donor_id BIGINT,
    donor_name VARCHAR(120) NOT NULL,
    donor_email VARCHAR(120) NOT NULL,
    donor_phone VARCHAR(30),
    donation_type VARCHAR(40) NOT NULL,
    amount DECIMAL(12, 2) DEFAULT 0.00,
    item_description TEXT,
    item_category VARCHAR(60),
    quantity INT DEFAULT 0,
    target_disaster_id BIGINT,
    status VARCHAR(40) NOT NULL DEFAULT 'PLEDGED',
    payment_channel VARCHAR(60) DEFAULT 'Bank Transfer (Simulated)',
    transaction_note TEXT,
    donation_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_donations_disaster FOREIGN KEY (target_disaster_id) REFERENCES disasters (id) ON DELETE SET NULL,
    INDEX idx_donations_ref (donation_ref),
    INDEX idx_donations_status (status)
) ENGINE=InnoDB;

-- 11. Donation Allocations Table
CREATE TABLE IF NOT EXISTS donation_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT NOT NULL,
    allocated_to VARCHAR(255) NOT NULL,
    amount_allocated DECIMAL(12, 2) DEFAULT 0.00,
    quantity_allocated INT DEFAULT 0,
    allocated_by_user_id BIGINT,
    allocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_alloc_donation FOREIGN KEY (donation_id) REFERENCES donations (id) ON DELETE CASCADE,
    CONSTRAINT fk_alloc_user FOREIGN KEY (allocated_by_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. Hospitals Directory Table
CREATE TABLE IF NOT EXISTS hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_number VARCHAR(40) NOT NULL,
    emergency_helpline VARCHAR(40) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    available_services TEXT NOT NULL,
    total_beds INT NOT NULL DEFAULT 50,
    available_beds INT NOT NULL DEFAULT 20,
    ambulance_count INT NOT NULL DEFAULT 3,
    representative_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hospitals_rep FOREIGN KEY (representative_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Ambulance Requests Table
CREATE TABLE IF NOT EXISTS ambulance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    citizen_id BIGINT,
    patient_name VARCHAR(120) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    pickup_latitude DECIMAL(10, 7),
    pickup_longitude DECIMAL(10, 7),
    condition_description TEXT NOT NULL,
    urgency VARCHAR(30) NOT NULL,
    assigned_hospital_id BIGINT,
    status VARCHAR(40) NOT NULL DEFAULT 'REQUESTED',
    notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    CONSTRAINT fk_ambulance_citizen FOREIGN KEY (citizen_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_ambulance_hospital FOREIGN KEY (assigned_hospital_id) REFERENCES hospitals (id) ON DELETE SET NULL,
    INDEX idx_ambulance_status (status)
) ENGINE=InnoDB;

-- 14. Emergency Alerts Table
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    affected_area VARCHAR(255) NOT NULL,
    severity VARCHAR(40) NOT NULL,
    disaster_id BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    broadcast_channel VARCHAR(40) NOT NULL DEFAULT 'ALL',
    published_by_user_id BIGINT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    CONSTRAINT fk_alerts_disaster FOREIGN KEY (disaster_id) REFERENCES disasters (id) ON DELETE SET NULL,
    CONSTRAINT fk_alerts_publisher FOREIGN KEY (published_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_alerts_status (status)
) ENGINE=InnoDB;

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
    delivery_channel VARCHAR(40) NOT NULL DEFAULT 'IN_APP',
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notif_recipient (recipient_id, is_read)
) ENGINE=InnoDB;

-- 16. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    performed_by VARCHAR(120) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 17. OTP Verifications Table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email (email, otp_code)
) ENGINE=InnoDB;
