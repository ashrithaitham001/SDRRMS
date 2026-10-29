package com.sdrrms.config;

import com.sdrrms.entity.*;
import com.sdrrms.entity.AmbulanceRequest.AmbulanceStatus;
import com.sdrrms.entity.AmbulanceRequest.Urgency;
import com.sdrrms.entity.Disaster.DisasterType;
import com.sdrrms.entity.Disaster.Severity;
import com.sdrrms.entity.Disaster.Status;
import com.sdrrms.entity.Donation.DonationStatus;
import com.sdrrms.entity.Donation.DonationType;
import com.sdrrms.entity.EmergencyAlert.AlertSeverity;
import com.sdrrms.entity.EmergencyAlert.AlertStatus;
import com.sdrrms.entity.EmergencyAlert.BroadcastChannel;
import com.sdrrms.entity.Mission.MissionStatus;
import com.sdrrms.entity.MissionAssignment.AssignmentStatus;
import com.sdrrms.entity.ReliefRequest.Priority;
import com.sdrrms.entity.ReliefRequest.RequestCategory;
import com.sdrrms.entity.ReliefRequest.RequestStatus;
import com.sdrrms.entity.Resource.ResourceCategory;
import com.sdrrms.entity.ResourceTransaction.TransactionType;
import com.sdrrms.entity.VolunteerProfile.AvailabilityStatus;
import com.sdrrms.entity.VolunteerProfile.VerificationStatus;
import com.sdrrms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private ReliefRequestRepository reliefRequestRepository;

    @Autowired
    private RequestStatusHistoryRepository historyRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ResourceTransactionRepository transactionRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private MissionAssignmentRepository missionAssignmentRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private DonationAllocationRepository donationAllocationRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private AmbulanceRequestRepository ambulanceRequestRepository;

    @Autowired
    private EmergencyAlertRepository alertRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("Database already contains users. Skipping initial sample seeding.");
            return;
        }

        logger.info("Initializing SDRRMS sample test data...");

        // 1. Seed Users
        User admin = createUser("Dr. Rajesh Sharma (Admin)", "admin@sdrrms.org", "+91 98765 00001", "Admin@123", Role.ADMIN, "Disaster Management HQ", "New Delhi", "Delhi");
        User official = createUser("Sunita Verma (District Collector)", "official@sdrrms.org", "+91 98765 00002", "Gov@123", Role.GOV_OFFICIAL, "District Collectorate, Civil Lines", "Cuttack", "Odisha");
        User citizen = createUser("Aarav Patel (Citizen)", "citizen@sdrrms.org", "+91 98765 00003", "Citizen@123", Role.CITIZEN, "House 42, Ward 9, Riverside Colony", "Cuttack", "Odisha");
        User volunteerUser1 = createUser("Priya Sen (Volunteer)", "volunteer@sdrrms.org", "+91 98765 00004", "Volunteer@123", Role.VOLUNTEER, "Sector 4, Green Park", "Bhubaneswar", "Odisha");
        User volunteerUser2 = createUser("Karan Singh (Rescue Specialist)", "karan@sdrrms.org", "+91 98765 00008", "Volunteer@123", Role.VOLUNTEER, "Block B, Lake View", "Cuttack", "Odisha");
        User ngo = createUser("Pratham Relief Foundation (NGO)", "ngo@sdrrms.org", "+91 98765 00005", "Ngo@123", Role.NGO_REPRESENTATIVE, "Relief Hub, Link Road", "Bhubaneswar", "Odisha");
        User donor = createUser("Vikram Malhotra (Philanthropist)", "donor@sdrrms.org", "+91 98765 00006", "Donor@123", Role.DONOR, "Malhotra Towers, Nariman Point", "Mumbai", "Maharashtra");
        User hospitalRep = createUser("Dr. Ananya Roy (Chief Medical Officer)", "hospital@sdrrms.org", "+91 98765 00007", "Hospital@123", Role.HOSPITAL_REP, "Medical Enclave, Ring Road", "Cuttack", "Odisha");

        // 2. Seed Volunteer Profiles
        VolunteerProfile vp1 = new VolunteerProfile();
        vp1.setUser(volunteerUser1);
        vp1.setSkills("First Aid Certified, Food Distribution, Crisis Counseling");
        vp1.setBloodGroup("O+");
        vp1.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        vp1.setVerificationStatus(VerificationStatus.VERIFIED);
        vp1.setCurrentLocationName("Bhubaneswar Central Camp");
        vp1.setCurrentLatitude(new BigDecimal("20.2961"));
        vp1.setCurrentLongitude(new BigDecimal("85.8245"));
        vp1.setTotalMissionsCompleted(6);
        volunteerProfileRepository.save(vp1);

        VolunteerProfile vp2 = new VolunteerProfile();
        vp2.setUser(volunteerUser2);
        vp2.setSkills("Swift Water Rescue, EMT, Heavy Vehicle Driving, Boat Handling");
        vp2.setBloodGroup("B+");
        vp2.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        vp2.setVerificationStatus(VerificationStatus.VERIFIED);
        vp2.setCurrentLocationName("Mahanadi Riverbank Relief Station");
        vp2.setCurrentLatitude(new BigDecimal("20.4625"));
        vp2.setCurrentLongitude(new BigDecimal("85.8828"));
        vp2.setTotalMissionsCompleted(12);
        volunteerProfileRepository.save(vp2);

        // 3. Seed Disasters
        Disaster flood = new Disaster();
        flood.setTitle("Mahanadi Basin Flash Floods 2026");
        flood.setDescription("Incessant torrential monsoon rains have caused the Mahanadi river to overflow, breaching embankments and submerging 14 lowland villages across Cuttack and Kendrapara districts.");
        flood.setDisasterType(DisasterType.FLOOD);
        flood.setSeverity(Severity.CRITICAL);
        flood.setStatus(Status.ACTIVE);
        flood.setLocationName("Cuttack-Kendrapara Riverine Belt, Odisha");
        flood.setLatitude(new BigDecimal("20.4625"));
        flood.setLongitude(new BigDecimal("85.8828"));
        flood.setAffectedRadiusKm(new BigDecimal("35.0"));
        flood.setEstimatedAffectedPeople(45000);
        flood.setReportedBy(official);
        flood.setStartDate(LocalDateTime.now().minusDays(3));
        disasterRepository.save(flood);

        Disaster cyclone = new Disaster();
        cyclone.setTitle("Severe Cyclonic Storm 'Sagar' Alert");
        cyclone.setDescription("Category-3 tropical cyclone approaching the eastern coastline with wind gusts up to 135 km/h and high tidal surge risk.");
        cyclone.setDisasterType(DisasterType.CYCLONE);
        cyclone.setSeverity(Severity.HIGH);
        cyclone.setStatus(Status.ACTIVE);
        cyclone.setLocationName("Paradeep Coastal Zone, Odisha");
        cyclone.setLatitude(new BigDecimal("20.3166"));
        cyclone.setLongitude(new BigDecimal("86.6114"));
        cyclone.setAffectedRadiusKm(new BigDecimal("60.0"));
        cyclone.setEstimatedAffectedPeople(120000);
        cyclone.setReportedBy(official);
        cyclone.setStartDate(LocalDateTime.now().minusDays(1));
        disasterRepository.save(cyclone);

        Disaster fire = new Disaster();
        fire.setTitle("Industrial Chemical Warehouse Fire Incident");
        fire.setDescription("Fire outbreak at industrial chemical storage unit. Smoke hazard contained within 3 km perimeter; immediate containment complete.");
        fire.setDisasterType(DisasterType.FIRE);
        fire.setSeverity(Severity.MEDIUM);
        fire.setStatus(Status.CONTAINED);
        fire.setLocationName("Mancheswar Industrial Zone, Bhubaneswar");
        fire.setLatitude(new BigDecimal("20.3200"));
        fire.setLongitude(new BigDecimal("85.8400"));
        fire.setAffectedRadiusKm(new BigDecimal("5.0"));
        fire.setEstimatedAffectedPeople(2500);
        fire.setReportedBy(admin);
        fire.setStartDate(LocalDateTime.now().minusDays(5));
        fire.setEndDate(LocalDateTime.now().minusDays(4));
        disasterRepository.save(fire);

        // 4. Seed Resources Inventory
        Resource r1 = createResource("1-Liter Packaged Drinking Water Cartons", ResourceCategory.WATER, 2400, "Cartons (12 bottles ea)", 300, "Central Relief Warehouse, Sector 3, Cuttack", new BigDecimal("20.4650"), new BigDecimal("85.8750"));
        Resource r2 = createResource("Emergency Ready-to-Eat Food Packets", ResourceCategory.FOOD, 1850, "Food Kits", 400, "Central Relief Warehouse, Sector 3, Cuttack", new BigDecimal("20.4650"), new BigDecimal("85.8750"));
        Resource r3 = createResource("Essential Antibiotic & Trauma First-Aid Kits", ResourceCategory.MEDICINE, 180, "Medical Kits", 200, "City District Medical Store", new BigDecimal("20.4700"), new BigDecimal("85.8900"));
        Resource r4 = createResource("Heavy Duty Tarpaulins & Waterproof Tents", ResourceCategory.SHELTER_KIT, 350, "Units", 100, "State Disaster Management Depot", new BigDecimal("20.2900"), new BigDecimal("85.8200"));
        Resource r5 = createResource("Portable Oxygen Cylinders (10L)", ResourceCategory.MEDICAL_EQUIPMENT, 45, "Cylinders", 50, "Apex General Hospital Reserve", new BigDecimal("20.4550"), new BigDecimal("85.8650"));
        Resource r6 = createResource("Thermal Blankets & Dry Clothing Bundles", ResourceCategory.CLOTHING, 850, "Bundles", 150, "Central Relief Warehouse, Sector 3, Cuttack", new BigDecimal("20.4650"), new BigDecimal("85.8750"));

        // 5. Seed Resource Transactions
        createTransaction(r1, TransactionType.OUTGOING_DISTRIBUTION, 300, "Relief Camp #2 (Riverside High School)", official, "Distributed to 150 evacuated families");
        createTransaction(r2, TransactionType.OUTGOING_DISTRIBUTION, 250, "Relief Camp #2 (Riverside High School)", official, "Ration distribution for 48 hours");
        createTransaction(r1, TransactionType.INCOMING_DONATION, 1000, "UNICEF Water Relief Donation", admin, "Bulk intake of bottled mineral water");

        // 6. Seed Relief Requests
        ReliefRequest req1 = new ReliefRequest();
        req1.setTrackingNumber("REQ-2026-10492");
        req1.setCitizen(citizen);
        req1.setDisaster(flood);
        req1.setCategory(RequestCategory.FOOD_WATER);
        req1.setPriority(Priority.HIGH);
        req1.setStatus(RequestStatus.IN_PROGRESS);
        req1.setContactName("Aarav Patel");
        req1.setContactPhone("+91 98765 00003");
        req1.setLocationAddress("Ward 9, Riverside Colony, Near Kali Mandir, Cuttack");
        req1.setLatitude(new BigDecimal("20.4710"));
        req1.setLongitude(new BigDecimal("85.8820"));
        req1.setPeopleAffected(18);
        req1.setDescription("Water level reached ground floor; drinking water and dry ration kits required for 4 stranded families.");
        req1.setAssignedVolunteer(volunteerUser1);
        req1.setAssignedNgoName("Pratham Relief Foundation");
        req1.setRemarks("Volunteer dispatched with 20 ration kits");
        reliefRequestRepository.save(req1);
        historyRepository.save(new RequestStatusHistory(req1, RequestStatus.SUBMITTED, RequestStatus.IN_PROGRESS, official, "Dispatched volunteer team"));

        // SOS Request
        ReliefRequest sosReq = new ReliefRequest();
        sosReq.setTrackingNumber("SOS-2026-99014");
        sosReq.setCitizen(citizen);
        sosReq.setDisaster(flood);
        sosReq.setCategory(RequestCategory.RESCUE);
        sosReq.setPriority(Priority.CRITICAL);
        sosReq.setStatus(RequestStatus.ASSIGNED);
        sosReq.setContactName("Manoj Das");
        sosReq.setContactPhone("+91 98765 43210");
        sosReq.setLocationAddress("Island Hamlet, River Delta Sector 2, Kendrapara Border");
        sosReq.setLatitude(new BigDecimal("20.4912"));
        sosReq.setLongitude(new BigDecimal("85.9125"));
        sosReq.setPeopleAffected(7);
        sosReq.setDescription("CRITICAL SOS: Elderly citizen experiencing acute respiratory distress and water rising past veranda. Inflatable rescue boat needed immediately!");
        sosReq.setAssignedVolunteer(volunteerUser2);
        sosReq.setSos(true);
        sosReq.setRemarks("NDRF boat team and EMT volunteer Karan deployed");
        reliefRequestRepository.save(sosReq);
        historyRepository.save(new RequestStatusHistory(sosReq, RequestStatus.SUBMITTED, RequestStatus.ASSIGNED, admin, "Emergency boat rescue assigned to Karan"));

        ReliefRequest req2 = new ReliefRequest();
        req2.setTrackingNumber("REQ-2026-20411");
        req2.setDisaster(cyclone);
        req2.setCategory(RequestCategory.SHELTER);
        req2.setPriority(Priority.MEDIUM);
        req2.setStatus(RequestStatus.SUBMITTED);
        req2.setContactName("Sunita Behera");
        req2.setContactPhone("+91 94370 12345");
        req2.setLocationAddress("Fisherman Colony, Paradeep Old Port, Paradeep");
        req2.setLatitude(new BigDecimal("20.3120"));
        req2.setLongitude(new BigDecimal("86.6080"));
        req2.setPeopleAffected(32);
        req2.setDescription("Thatched roofs damaged by high winds; need 10 tarpaulin sheets and rope before evening rains.");
        req2.setSos(false);
        reliefRequestRepository.save(req2);
        historyRepository.save(new RequestStatusHistory(req2, null, RequestStatus.SUBMITTED, null, "Submitted by village head"));

        // 7. Seed Relief Missions
        Mission m1 = new Mission();
        m1.setTitle("Flood Evacuation & Food Delivery - Ward 9");
        m1.setDescription("Conduct door-to-door welfare checks and distribute drinking water and food rations to families stranded in Riverside Colony.");
        m1.setDisaster(flood);
        m1.setStatus(MissionStatus.IN_PROGRESS);
        m1.setLocationName("Riverside Colony & Bank Street, Cuttack");
        m1.setLatitude(new BigDecimal("20.4700"));
        m1.setLongitude(new BigDecimal("85.8800"));
        m1.setTargetBeneficiaries(150);
        m1.setStartDate(LocalDateTime.now().minusDays(1));
        m1.setLeadOfficer(official);
        missionRepository.save(m1);

        MissionAssignment ma1 = new MissionAssignment();
        ma1.setMission(m1);
        ma1.setVolunteer(volunteerUser1);
        ma1.setStatus(AssignmentStatus.IN_PROGRESS);
        ma1.setNotes("Delivering supplies to northern cluster");
        missionAssignmentRepository.save(ma1);

        // 8. Seed Donations
        Donation d1 = new Donation();
        d1.setDonationRef("DON-2026-5012");
        d1.setDonor(donor);
        d1.setDonorName("Vikram Malhotra");
        d1.setDonorEmail("donor@sdrrms.org");
        d1.setDonorPhone("+91 98765 00006");
        d1.setDonationType(DonationType.MONETARY);
        d1.setAmount(new BigDecimal("250000.00"));
        d1.setTargetDisaster(flood);
        d1.setStatus(DonationStatus.ALLOCATED);
        d1.setPaymentChannel("Direct Bank NEFT (Simulated)");
        d1.setTransactionNote("Monetary contribution specifically targeted for medical kits and drinking water");
        d1.setDonationDate(LocalDateTime.now().minusDays(2));
        donationRepository.save(d1);

        DonationAllocation da1 = new DonationAllocation();
        da1.setDonation(d1);
        da1.setAllocatedTo("Procurement of 150 Essential First Aid & Antibiotic Kits");
        da1.setAmountAllocated(new BigDecimal("150000.00"));
        da1.setAllocatedBy(admin);
        da1.setNotes("Vendor PO #MED-2026-88 issued to Cipla/Red Cross Distributor");
        donationAllocationRepository.save(da1);

        Donation d2 = new Donation();
        d2.setDonationRef("DON-2026-6104");
        d2.setDonor(donor);
        d2.setDonorName("Rotary Club Regional Chapter");
        d2.setDonorEmail("contact@rotaryrelief.org");
        d2.setDonorPhone("+91 98111 22334");
        d2.setDonationType(DonationType.MATERIAL);
        d2.setItemDescription("500 Thermal Woolen Blankets and 100 Hygiene Kits");
        d2.setItemCategory("CLOTHING & HYGIENE");
        d2.setQuantity(600);
        d2.setTargetDisaster(flood);
        d2.setStatus(DonationStatus.RECEIVED);
        d2.setPaymentChannel("Material In-Kind Dropoff");
        d2.setTransactionNote("Received and inspected at Central Relief Warehouse");
        d2.setDonationDate(LocalDateTime.now().minusDays(1));
        donationRepository.save(d2);

        // 9. Seed Hospitals & Ambulance Requests
        Hospital h1 = new Hospital();
        h1.setName("SCB Medical College & Hospital");
        h1.setContactNumber("+91 671 2414080");
        h1.setEmergencyHelpline("108 / 0671-2414111");
        h1.setAddress("Mangalabag, Cuttack, Odisha 753007");
        h1.setCity("Cuttack");
        h1.setLatitude(new BigDecimal("20.4650"));
        h1.setLongitude(new BigDecimal("85.8920"));
        h1.setAvailableServices("24x7 Level-1 Trauma Center, Burn Unit, ICU (60 beds), Emergency Dialysis, Blood Bank, Pediatric Emergency");
        h1.setTotalBeds(1200);
        h1.setAvailableBeds(145);
        h1.setAmbulanceCount(12);
        h1.setRepresentative(hospitalRep);
        hospitalRepository.save(h1);

        Hospital h2 = new Hospital();
        h2.setName("AIIMS Bhubaneswar Emergency Division");
        h2.setContactNumber("+91 674 2476789");
        h2.setEmergencyHelpline("0674-2476000");
        h2.setAddress("Sijua, Patrapada, Bhubaneswar, Odisha 751019");
        h2.setCity("Bhubaneswar");
        h2.setLatitude(new BigDecimal("20.2312"));
        h2.setLongitude(new BigDecimal("85.7725"));
        h2.setAvailableServices("Super Specialty Trauma, Advanced Cardiac Care, Infectious Disease Isolation Ward, Helipad Evacuation");
        h2.setTotalBeds(950);
        h2.setAvailableBeds(82);
        h2.setAmbulanceCount(8);
        hospitalRepository.save(h2);

        AmbulanceRequest amb1 = new AmbulanceRequest();
        amb1.setRequestNumber("AMB-2026-301");
        amb1.setCitizen(citizen);
        amb1.setPatientName("Ramesh Jena (Age 64)");
        amb1.setContactPhone("+91 98765 00003");
        amb1.setPickupAddress("Ward 9 Community Shelter, Cuttack");
        amb1.setPickupLatitude(new BigDecimal("20.4705"));
        amb1.setPickupLongitude(new BigDecimal("85.8815"));
        amb1.setConditionDescription("High fever with severe dehydration and chest congestion from flood exposure");
        amb1.setUrgency(Urgency.CRITICAL);
        amb1.setAssignedHospital(h1);
        amb1.setStatus(AmbulanceStatus.DISPATCHED);
        amb1.setNotes("Ambulance Unit 04 en route with EMT and oxygen support");
        ambulanceRequestRepository.save(amb1);

        // 10. Seed Emergency Alerts
        EmergencyAlert alert1 = new EmergencyAlert();
        alert1.setTitle("HIGH WATER LEVEL WARNING - MAHANADI BASIN");
        alert1.setMessage("Water release from Hirakud Reservoir has reached peak discharge of 4.5 lakh cusecs. Low-lying areas in Cuttack, Jagatsinghpur and Kendrapara must evacuate immediately to designated high-ground storm shelters.");
        alert1.setAffectedArea("Cuttack, Jagatsinghpur, Kendrapara Lowlands");
        alert1.setSeverity(AlertSeverity.CRITICAL_EVACUATION);
        alert1.setDisaster(flood);
        alert1.setStatus(AlertStatus.ACTIVE);
        alert1.setBroadcastChannel(BroadcastChannel.ALL);
        alert1.setPublishedBy(official);
        alert1.setPublishedAt(LocalDateTime.now().minusHours(4));
        alert1.setExpiresAt(LocalDateTime.now().plusDays(2));
        alertRepository.save(alert1);

        EmergencyAlert alert2 = new EmergencyAlert();
        alert2.setTitle("CYCLONE SAGAR: FISHERMEN ADVISORY");
        alert2.setMessage("Strict prohibition on venturing into Bay of Bengal coast. Squally winds reaching 70-85 km/h expected by midnight. Secure vessels and unreinforced dwellings.");
        alert2.setAffectedArea("Paradeep, Puri, Dhamra Coastal Belts");
        alert2.setSeverity(AlertSeverity.WARNING);
        alert2.setDisaster(cyclone);
        alert2.setStatus(AlertStatus.ACTIVE);
        alert2.setBroadcastChannel(BroadcastChannel.ALL);
        alert2.setPublishedBy(official);
        alert2.setPublishedAt(LocalDateTime.now().minusHours(10));
        alert2.setExpiresAt(LocalDateTime.now().plusDays(3));
        alertRepository.save(alert2);

        logger.info("Successfully seeded comprehensive SDRRMS test data with 7 core roles!");
    }

    private User createUser(String name, String email, String phone, String password, Role role, String address, String city, String state) {
        User u = new User();
        u.setFullName(name);
        u.setEmail(email);
        u.setPhoneNumber(phone);
        u.setPasswordHash(encoder.encode(password));
        u.setRole(role);
        u.setActive(true);
        u.setVerified(true);
        u.setAddress(address);
        u.setCity(city);
        u.setState(state);
        return userRepository.save(u);
    }

    private Resource createResource(String name, ResourceCategory cat, int qty, String unit, int threshold, String loc, BigDecimal lat, BigDecimal lng) {
        Resource r = new Resource();
        r.setName(name);
        r.setCategory(cat);
        r.setQuantity(qty);
        r.setUnit(unit);
        r.setMinThreshold(threshold);
        r.setStorageLocation(loc);
        r.setLatitude(lat);
        r.setLongitude(lng);
        r.setExpiryDate(LocalDate.now().plusMonths(12));
        return resourceRepository.save(r);
    }

    private void createTransaction(Resource r, TransactionType type, int qty, String recipient, User handler, String remarks) {
        ResourceTransaction tx = new ResourceTransaction();
        tx.setResource(r);
        tx.setTransactionType(type);
        tx.setQuantity(qty);
        tx.setRecipientOrSource(recipient);
        tx.setHandledBy(handler);
        tx.setRemarks(remarks);
        transactionRepository.save(tx);
    }
}
