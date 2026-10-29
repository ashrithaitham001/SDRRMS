-- ====================================================================
-- Smart Disaster Relief Resource Management System (SDRRMS)
-- Sample Demonstration Data for MySQL 8.0+
-- Passwords for all accounts are BCrypt hashed:
-- admin@sdrrms.org       / Admin@123
-- official@sdrrms.org    / Gov@123
-- citizen@sdrrms.org     / Citizen@123
-- volunteer@sdrrms.org   / Volunteer@123
-- ngo@sdrrms.org         / Ngo@123
-- donor@sdrrms.org       / Donor@123
-- hospital@sdrrms.org    / Hospital@123
-- ====================================================================

USE sdrrms_db;

-- 1. Insert Users
INSERT INTO users (id, full_name, email, phone_number, password_hash, role, is_active, is_verified, address, city, state, created_at)
VALUES
(1, 'Dr. Rajesh Sharma (Admin)', 'admin@sdrrms.org', '+91 98765 00001', '$2a$10$wE6F3M9k89QJ3Xk0Bv60b.V8Y23K7E9uVwW37O658y28G2yW6w672', 'ADMIN', 1, 1, 'Disaster Management HQ', 'New Delhi', 'Delhi', NOW()),
(2, 'Sunita Verma (District Collector)', 'official@sdrrms.org', '+91 98765 00002', '$2a$10$wE6F3M9k89QJ3Xk0Bv60b.V8Y23K7E9uVwW37O658y28G2yW6w672', 'GOV_OFFICIAL', 1, 1, 'District Collectorate, Civil Lines', 'Cuttack', 'Odisha', NOW()),
(3, 'Aarav Patel (Citizen)', 'citizen@sdrrms.org', '+91 98765 00003', '$2a$10$wE6F3M9k89QJ3Xk0Bv60b.V8Y23K7E9uVwW37O658y28G2yW6w672', 'CITIZEN', 1, 1, 'House 42, Ward 9, Riverside Colony', 'Cuttack', 'Odisha', NOW()),
(4, 'Priya Sen (Volunteer)', 'volunteer@sdrrms.org', '+91 98765 00004', '$2a$10$wE6F3M9k89QJ3Xk0Bv60b.V8Y23K7E9uVwW37O658y28G2yW6w672', 'VOLUNTEER', 1, 1, 'Sector 4, Green Park', 'Bhubaneswar', 'Odisha', NOW()),
(5, 'Pratham Relief Foundation (NGO)', 'ngo@sdrrms.org', '+91 98765 00005', '$2a$10$wE6F3M9k89QJ3Xk0Bv60b.V8Y23K7E9uVwW37O658y28G2yW6w672', 'NGO_REPRESENTATIVE', 1, 1, 'Relief Hub, Link Road', 'Bhubaneswar', 'Odisha', NOW()),
(6, 'Vikram Malhotra (Philanthropist)', 'donor@sdrrms.org', '+91 98765 00006', '$2a$10$wE6F3M9k89QJ3Xk0Bv60b.V8Y23K7E9uVwW37O658y28G2yW6w672', 'DONOR', 1, 1, 'Malhotra Towers, Nariman Point', 'Mumbai', 'Maharashtra', NOW()),
(7, 'Dr. Ananya Roy (Chief Medical Officer)', 'hospital@sdrrms.org', '+91 98765 00007', '$2a$10$wE6F3M9k89QJ3Xk0Bv60b.V8Y23K7E9uVwW37O658y28G2yW6w672', 'HOSPITAL_REP', 1, 1, 'Medical Enclave, Ring Road', 'Cuttack', 'Odisha', NOW()),
(8, 'Karan Singh (Rescue Specialist)', 'karan@sdrrms.org', '+91 98765 00008', '$2a$10$wE6F3M9k89QJ3Xk0Bv60b.V8Y23K7E9uVwW37O658y28G2yW6w672', 'VOLUNTEER', 1, 1, 'Block B, Lake View', 'Cuttack', 'Odisha', NOW())
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. Volunteer Profiles
INSERT INTO volunteer_profiles (id, user_id, skills, availability_status, current_latitude, current_longitude, current_location_name, blood_group, verification_status, total_missions_completed, created_at)
VALUES
(1, 4, 'First Aid Certified, Food Distribution, Crisis Counseling', 'AVAILABLE', 20.2961, 85.8245, 'Bhubaneswar Central Camp', 'O+', 'VERIFIED', 6, NOW()),
(2, 8, 'Swift Water Rescue, EMT, Heavy Vehicle Driving, Boat Handling', 'AVAILABLE', 20.4625, 85.8828, 'Mahanadi Riverbank Relief Station', 'B+', 'VERIFIED', 12, NOW())
ON DUPLICATE KEY UPDATE skills=VALUES(skills);

-- 3. Disasters
INSERT INTO disasters (id, title, description, disaster_type, severity, status, location_name, latitude, longitude, affected_radius_km, estimated_affected_people, reported_by_user_id, start_date, created_at)
VALUES
(1, 'Mahanadi Basin Flash Floods 2026', 'Incessant torrential monsoon rains have caused the Mahanadi river to overflow, breaching embankments and submerging 14 lowland villages.', 'FLOOD', 'CRITICAL', 'ACTIVE', 'Cuttack-Kendrapara Riverine Belt, Odisha', 20.4625, 85.8828, 35.0, 45000, 2, NOW() - INTERVAL 3 DAY, NOW()),
(2, 'Severe Cyclonic Storm Sagar Alert', 'Category-3 tropical cyclone approaching eastern coastline with wind gusts up to 135 km/h and high tidal surge risk.', 'CYCLONE', 'HIGH', 'ACTIVE', 'Paradeep Coastal Zone, Odisha', 20.3166, 86.6114, 60.0, 120000, 2, NOW() - INTERVAL 1 DAY, NOW()),
(3, 'Industrial Chemical Storage Fire Incident', 'Fire outbreak at industrial chemical storage unit. Smoke hazard contained within 3 km perimeter; containment complete.', 'FIRE', 'MEDIUM', 'CONTAINED', 'Mancheswar Industrial Zone, Bhubaneswar', 20.3200, 85.8400, 5.0, 2500, 1, NOW() - INTERVAL 5 DAY, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Resources
INSERT INTO resources (id, name, category, quantity, unit, min_threshold, storage_location, latitude, longitude, expiry_date, status, created_at)
VALUES
(1, '1-Liter Packaged Drinking Water Cartons', 'WATER', 2400, 'Cartons (12 bottles ea)', 300, 'Central Relief Warehouse, Sector 3, Cuttack', 20.4650, 85.8750, '2027-10-15', 'AVAILABLE', NOW()),
(2, 'Emergency Ready-to-Eat Food Packets', 'FOOD', 1850, 'Food Kits', 400, 'Central Relief Warehouse, Sector 3, Cuttack', 20.4650, 85.8750, '2027-04-15', 'AVAILABLE', NOW()),
(3, 'Essential Antibiotic & Trauma First-Aid Kits', 'MEDICINE', 180, 'Medical Kits', 200, 'City District Medical Store', 20.4700, 85.8900, '2028-01-01', 'LOW_STOCK', NOW()),
(4, 'Heavy Duty Tarpaulins & Waterproof Tents', 'SHELTER_KIT', 350, 'Units', 100, 'State Disaster Management Depot', 20.2900, 85.8200, NULL, 'AVAILABLE', NOW()),
(5, 'Portable Oxygen Cylinders (10L)', 'MEDICAL_EQUIPMENT', 45, 'Cylinders', 50, 'Apex General Hospital Reserve', 20.4550, 85.8650, NULL, 'LOW_STOCK', NOW()),
(6, 'Thermal Blankets & Dry Clothing Bundles', 'CLOTHING', 850, 'Bundles', 150, 'Central Relief Warehouse, Sector 3, Cuttack', 20.4650, 85.8750, NULL, 'AVAILABLE', NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Resource Transactions
INSERT INTO resource_transactions (id, resource_id, transaction_type, quantity, recipient_or_source, handled_by_user_id, remarks, timestamp)
VALUES
(1, 1, 'INCOMING_DONATION', 1000, 'UNICEF Water Relief Donation', 1, 'Bulk intake of bottled mineral water', NOW() - INTERVAL 2 DAY),
(2, 1, 'OUTGOING_DISTRIBUTION', 300, 'Relief Camp #2 (Riverside High School)', 2, 'Distributed to 150 evacuated families', NOW() - INTERVAL 1 DAY),
(3, 2, 'OUTGOING_DISTRIBUTION', 250, 'Relief Camp #2 (Riverside High School)', 2, 'Ration distribution for 48 hours', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- 6. Relief Requests
INSERT INTO relief_requests (id, tracking_number, citizen_id, disaster_id, category, priority, status, contact_name, contact_phone, location_address, latitude, longitude, people_affected, description, assigned_volunteer_id, assigned_ngo_name, is_sos, remarks, created_at)
VALUES
(1, 'REQ-2026-10492', 3, 1, 'FOOD_WATER', 'HIGH', 'IN_PROGRESS', 'Aarav Patel', '+91 98765 00003', 'Ward 9, Riverside Colony, Near Kali Mandir, Cuttack', 20.4710, 85.8820, 18, 'Water level reached ground floor; drinking water and dry ration kits required for 4 stranded families.', 4, 'Pratham Relief Foundation', 0, 'Volunteer dispatched with 20 ration kits', NOW() - INTERVAL 1 DAY),
(2, 'SOS-2026-99014', 3, 1, 'RESCUE', 'CRITICAL', 'ASSIGNED', 'Manoj Das', '+91 98765 43210', 'Island Hamlet, River Delta Sector 2, Kendrapara Border', 20.4912, 85.9125, 7, 'CRITICAL SOS: Elderly citizen experiencing acute respiratory distress and water rising past veranda. Inflatable rescue boat needed immediately!', 8, NULL, 1, 'NDRF boat team and EMT volunteer Karan deployed', NOW() - INTERVAL 4 HOUR),
(3, 'REQ-2026-20411', NULL, 2, 'SHELTER', 'MEDIUM', 'SUBMITTED', 'Sunita Behera', '+91 94370 12345', 'Fisherman Colony, Paradeep Old Port, Paradeep', 20.3120, 86.6080, 32, 'Thatched roofs damaged by high winds; need 10 tarpaulin sheets and rope before evening rains.', NULL, NULL, 0, 'Submitted by village head', NOW() - INTERVAL 6 HOUR)
ON DUPLICATE KEY UPDATE tracking_number=VALUES(tracking_number);

-- 7. Request Status History
INSERT INTO request_status_history (id, relief_request_id, previous_status, new_status, changed_by_user_id, remarks, timestamp)
VALUES
(1, 1, NULL, 'SUBMITTED', 3, 'Request registered by citizen', NOW() - INTERVAL 1 DAY),
(2, 1, 'SUBMITTED', 'IN_PROGRESS', 2, 'Dispatched volunteer team and ration supplies', NOW() - INTERVAL 18 HOUR),
(3, 2, NULL, 'SUBMITTED', 3, 'CRITICAL SOS Emergency submitted', NOW() - INTERVAL 4 HOUR),
(4, 2, 'SUBMITTED', 'ASSIGNED', 1, 'Emergency boat rescue assigned to Karan', NOW() - INTERVAL 3 HOUR)
ON DUPLICATE KEY UPDATE new_status=VALUES(new_status);

-- 8. Relief Missions
INSERT INTO missions (id, title, description, disaster_id, status, location_name, latitude, longitude, target_beneficiaries, start_date, lead_officer_id, created_at)
VALUES
(1, 'Flood Evacuation & Food Delivery - Ward 9', 'Conduct door-to-door welfare checks and distribute drinking water and food rations to families stranded in Riverside Colony.', 1, 'IN_PROGRESS', 'Riverside Colony & Bank Street, Cuttack', 20.4700, 85.8800, 150, NOW() - INTERVAL 1 DAY, 2, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 9. Mission Assignments
INSERT INTO mission_assignments (id, mission_id, volunteer_id, status, assigned_at, notes)
VALUES
(1, 1, 4, 'IN_PROGRESS', NOW() - INTERVAL 1 DAY, 'Delivering supplies to northern cluster')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 10. Donations & Allocations
INSERT INTO donations (id, donation_ref, donor_id, donor_name, donor_email, donor_phone, donation_type, amount, target_disaster_id, status, payment_channel, transaction_note, donation_date, created_at)
VALUES
(1, 'DON-2026-5012', 6, 'Vikram Malhotra', 'donor@sdrrms.org', '+91 98765 00006', 'MONETARY', 250000.00, 1, 'ALLOCATED', 'Direct Bank NEFT (Simulated)', 'Monetary contribution specifically targeted for medical kits and drinking water', NOW() - INTERVAL 2 DAY, NOW()),
(2, 'DON-2026-6104', 6, 'Rotary Club Regional Chapter', 'contact@rotaryrelief.org', '+91 98111 22334', 'MATERIAL', 0.00, 1, 'RECEIVED', 'Material In-Kind Dropoff', '500 Thermal Woolen Blankets and 100 Hygiene Kits', NOW() - INTERVAL 1 DAY, NOW())
ON DUPLICATE KEY UPDATE donation_ref=VALUES(donation_ref);

INSERT INTO donation_allocations (id, donation_id, allocated_to, amount_allocated, quantity_allocated, allocated_by_user_id, notes, allocation_date)
VALUES
(1, 1, 'Procurement of 150 Essential First Aid & Antibiotic Kits', 150000.00, 150, 1, 'Vendor PO #MED-2026-88 issued to distributor', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE allocated_to=VALUES(allocated_to);

-- 11. Hospitals & Ambulances
INSERT INTO hospitals (id, name, contact_number, emergency_helpline, address, city, latitude, longitude, available_services, total_beds, available_beds, ambulance_count, representative_user_id, created_at)
VALUES
(1, 'SCB Medical College & Hospital', '+91 671 2414080', '108 / 0671-2414111', 'Mangalabag, Cuttack, Odisha 753007', 'Cuttack', 20.4650, 85.8920, '24x7 Level-1 Trauma Center, Burn Unit, ICU (60 beds), Emergency Dialysis, Blood Bank', 1200, 145, 12, 7, NOW()),
(2, 'AIIMS Bhubaneswar Emergency Division', '+91 674 2476789', '0674-2476000', 'Sijua, Patrapada, Bhubaneswar, Odisha 751019', 'Bhubaneswar', 20.2312, 85.7725, 'Super Specialty Trauma, Advanced Cardiac Care, Infectious Disease Isolation Ward, Helipad', 950, 82, 8, NULL, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO ambulance_requests (id, request_number, citizen_id, patient_name, contact_phone, pickup_address, pickup_latitude, pickup_longitude, condition_description, urgency, assigned_hospital_id, status, notes, requested_at)
VALUES
(1, 'AMB-2026-301', 3, 'Ramesh Jena (Age 64)', '+91 98765 00003', 'Ward 9 Community Shelter, Cuttack', 20.4705, 85.8815, 'High fever with severe dehydration and chest congestion from flood exposure', 'CRITICAL', 1, 'DISPATCHED', 'Ambulance Unit 04 en route with EMT and oxygen support', NOW() - INTERVAL 2 HOUR)
ON DUPLICATE KEY UPDATE request_number=VALUES(request_number);

-- 12. Emergency Alerts
INSERT INTO emergency_alerts (id, title, message, affected_area, severity, disaster_id, status, broadcast_channel, published_by_user_id, published_at, expires_at)
VALUES
(1, 'HIGH WATER LEVEL WARNING - MAHANADI BASIN', 'Water release from Hirakud Reservoir has reached peak discharge of 4.5 lakh cusecs. Low-lying areas in Cuttack, Jagatsinghpur and Kendrapara must evacuate immediately to designated storm shelters.', 'Cuttack, Jagatsinghpur, Kendrapara Lowlands', 'CRITICAL_EVACUATION', 1, 'ACTIVE', 'ALL', 2, NOW() - INTERVAL 4 HOUR, NOW() + INTERVAL 2 DAY),
(2, 'CYCLONE SAGAR: COASTAL ADVISORY', 'Strict prohibition on venturing into Bay of Bengal coast. Squally winds reaching 70-85 km/h expected by midnight. Secure vessels and unreinforced dwellings.', 'Paradeep, Puri, Dhamra Coastal Belts', 'WARNING', 2, 'ACTIVE', 'ALL', 2, NOW() - INTERVAL 10 HOUR, NOW() + INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 13. Audit Logs
INSERT INTO audit_logs (id, action, entity_name, entity_id, performed_by, details, timestamp)
VALUES
(1, 'INITIALIZE_SYSTEM', 'System', '0', 'SYSTEM', 'SDRRMS Platform initialized with demonstration baseline data', NOW() - INTERVAL 3 DAY),
(2, 'CREATE_DISASTER', 'Disaster', '1', 'official@sdrrms.org', 'Registered Mahanadi Basin Flash Floods 2026', NOW() - INTERVAL 3 DAY),
(3, 'SOS_TRIGGERED', 'ReliefRequest', '2', 'citizen@sdrrms.org', 'CRITICAL SOS: SOS-2026-99014 registered from River Delta Sector 2', NOW() - INTERVAL 4 HOUR)
ON DUPLICATE KEY UPDATE action=VALUES(action);
