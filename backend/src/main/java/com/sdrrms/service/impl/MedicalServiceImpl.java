package com.sdrrms.service.impl;

import com.sdrrms.dto.request.AmbulanceRequestDto;
import com.sdrrms.dto.request.HospitalDto;
import com.sdrrms.entity.AmbulanceRequest;
import com.sdrrms.entity.AmbulanceRequest.AmbulanceStatus;
import com.sdrrms.entity.AmbulanceRequest.Urgency;
import com.sdrrms.entity.Hospital;
import com.sdrrms.entity.Notification.DeliveryChannel;
import com.sdrrms.entity.Notification.NotificationType;
import com.sdrrms.entity.User;
import com.sdrrms.exception.ResourceNotFoundException;
import com.sdrrms.repository.AmbulanceRequestRepository;
import com.sdrrms.repository.HospitalRepository;
import com.sdrrms.repository.UserRepository;
import com.sdrrms.service.AuditLogService;
import com.sdrrms.service.MedicalService;
import com.sdrrms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
public class MedicalServiceImpl implements MedicalService {

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private AmbulanceRequestRepository ambulanceRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    private final SecureRandom random = new SecureRandom();

    private String generateAmbulanceRequestNumber() {
        int year = Year.now().getValue();
        int num = 100 + random.nextInt(900);
        return "AMB-" + year + "-" + num;
    }

    @Override
    public List<Hospital> getAllHospitals(String city, String search) {
        String cleanCity = (city != null && !city.isBlank()) ? city.trim() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return hospitalRepository.searchHospitals(cleanCity, cleanSearch);
    }

    @Override
    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
    }

    @Override
    @Transactional
    public Hospital createHospital(HospitalDto dto, Long representativeUserId) {
        User rep = representativeUserId != null ? userRepository.findById(representativeUserId).orElse(null) : null;

        Hospital h = new Hospital();
        h.setName(dto.getName());
        h.setContactNumber(dto.getContactNumber());
        h.setEmergencyHelpline(dto.getEmergencyHelpline());
        h.setAddress(dto.getAddress());
        h.setCity(dto.getCity());
        h.setLatitude(dto.getLatitude());
        h.setLongitude(dto.getLongitude());
        h.setAvailableServices(dto.getAvailableServices());
        h.setTotalBeds(dto.getTotalBeds());
        h.setAvailableBeds(dto.getAvailableBeds());
        h.setAmbulanceCount(dto.getAmbulanceCount());
        h.setRepresentative(rep);

        Hospital saved = hospitalRepository.save(h);
        auditLogService.log("CREATE_HOSPITAL", "Hospital", saved.getId().toString(),
                rep != null ? rep.getEmail() : "SYSTEM", "Registered hospital: " + saved.getName());
        return saved;
    }

    @Override
    @Transactional
    public Hospital updateHospital(Long id, HospitalDto dto, Long updatedByUserId) {
        Hospital h = getHospitalById(id);
        h.setName(dto.getName());
        h.setContactNumber(dto.getContactNumber());
        h.setEmergencyHelpline(dto.getEmergencyHelpline());
        h.setAddress(dto.getAddress());
        h.setCity(dto.getCity());
        h.setLatitude(dto.getLatitude());
        h.setLongitude(dto.getLongitude());
        h.setAvailableServices(dto.getAvailableServices());
        h.setTotalBeds(dto.getTotalBeds());
        h.setAvailableBeds(dto.getAvailableBeds());
        h.setAmbulanceCount(dto.getAmbulanceCount());

        Hospital saved = hospitalRepository.save(h);
        auditLogService.log("UPDATE_HOSPITAL", "Hospital", saved.getId().toString(),
                userRepository.findById(updatedByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Updated hospital details: " + saved.getName());
        return saved;
    }

    @Override
    @Transactional
    public void deleteHospital(Long id, Long deletedByUserId) {
        Hospital h = getHospitalById(id);
        hospitalRepository.delete(h);
        auditLogService.log("DELETE_HOSPITAL", "Hospital", id.toString(),
                userRepository.findById(deletedByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Deleted hospital: " + h.getName());
    }

    @Override
    @Transactional
    public AmbulanceRequest requestAmbulance(AmbulanceRequestDto dto, Long citizenUserId) {
        User citizen = citizenUserId != null ? userRepository.findById(citizenUserId).orElse(null) : null;
        Hospital hospital = dto.getAssignedHospitalId() != null ? hospitalRepository.findById(dto.getAssignedHospitalId()).orElse(null) : null;

        AmbulanceRequest amb = new AmbulanceRequest();
        amb.setRequestNumber(generateAmbulanceRequestNumber());
        amb.setCitizen(citizen);
        amb.setPatientName(dto.getPatientName());
        amb.setContactPhone(dto.getContactPhone());
        amb.setPickupAddress(dto.getPickupAddress());
        amb.setPickupLatitude(dto.getPickupLatitude());
        amb.setPickupLongitude(dto.getPickupLongitude());
        amb.setConditionDescription(dto.getConditionDescription());
        amb.setUrgency(dto.getUrgency() != null ? dto.getUrgency() : Urgency.HIGH);
        amb.setAssignedHospital(hospital);
        amb.setStatus(AmbulanceStatus.REQUESTED);
        amb.setNotes(dto.getNotes());

        AmbulanceRequest saved = ambulanceRequestRepository.save(amb);

        if (citizen != null) {
            notificationService.sendNotification(citizen,
                    "Ambulance Request Dispatched: " + saved.getRequestNumber(),
                    "Your ambulance request for " + saved.getPatientName() + " has been logged (ID: " + saved.getRequestNumber() + "). Responders are notified.",
                    NotificationType.REQUEST_UPDATE, DeliveryChannel.IN_APP, saved.getRequestNumber());
        }

        auditLogService.log("REQUEST_AMBULANCE", "AmbulanceRequest", saved.getId().toString(),
                citizen != null ? citizen.getEmail() : "EMERGENCY_CALLER",
                "Ambulance requested: " + saved.getRequestNumber());
        return saved;
    }

    @Override
    public AmbulanceRequest getAmbulanceRequestById(Long id) {
        return ambulanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance request not found with id: " + id));
    }

    @Override
    public AmbulanceRequest getAmbulanceRequestByNumber(String requestNumber) {
        return ambulanceRequestRepository.findByRequestNumber(requestNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance request not found with number: " + requestNumber));
    }

    @Override
    @Transactional
    public AmbulanceRequest updateAmbulanceStatus(Long id, AmbulanceStatus status, Long hospitalId, String notes, Long handledByUserId) {
        AmbulanceRequest amb = getAmbulanceRequestById(id);
        amb.setStatus(status);
        if (hospitalId != null) {
            hospitalRepository.findById(hospitalId).ifPresent(amb::setAssignedHospital);
        }
        if (notes != null) amb.setNotes(notes);
        if (status == AmbulanceStatus.COMPLETED) {
            amb.setResolvedAt(LocalDateTime.now());
        }

        AmbulanceRequest saved = ambulanceRequestRepository.save(amb);

        if (saved.getCitizen() != null) {
            notificationService.sendNotification(saved.getCitizen(),
                    "Ambulance Update: " + saved.getRequestNumber(),
                    "Your ambulance request is now: " + status,
                    NotificationType.REQUEST_UPDATE, DeliveryChannel.IN_APP, saved.getRequestNumber());
        }

        auditLogService.log("UPDATE_AMBULANCE_STATUS", "AmbulanceRequest", saved.getId().toString(),
                userRepository.findById(handledByUserId).map(User::getEmail).orElse("SYSTEM"),
                "Ambulance status updated to " + status);
        return saved;
    }

    @Override
    public List<AmbulanceRequest> getAllAmbulanceRequests() {
        return ambulanceRequestRepository.findAll();
    }

    @Override
    public List<AmbulanceRequest> getCitizenAmbulanceRequests(Long citizenUserId) {
        return ambulanceRequestRepository.findByCitizenId(citizenUserId);
    }
}
