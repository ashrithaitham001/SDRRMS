package com.sdrrms.service;

import com.sdrrms.dto.request.AmbulanceRequestDto;
import com.sdrrms.dto.request.HospitalDto;
import com.sdrrms.entity.AmbulanceRequest;
import com.sdrrms.entity.AmbulanceRequest.AmbulanceStatus;
import com.sdrrms.entity.Hospital;

import java.util.List;

public interface MedicalService {
    List<Hospital> getAllHospitals(String city, String search);
    Hospital getHospitalById(Long id);
    Hospital createHospital(HospitalDto dto, Long representativeUserId);
    Hospital updateHospital(Long id, HospitalDto dto, Long updatedByUserId);
    void deleteHospital(Long id, Long deletedByUserId);

    AmbulanceRequest requestAmbulance(AmbulanceRequestDto dto, Long citizenUserId);
    AmbulanceRequest getAmbulanceRequestById(Long id);
    AmbulanceRequest getAmbulanceRequestByNumber(String requestNumber);
    AmbulanceRequest updateAmbulanceStatus(Long id, AmbulanceStatus status, Long hospitalId, String notes, Long handledByUserId);
    List<AmbulanceRequest> getAllAmbulanceRequests();
    List<AmbulanceRequest> getCitizenAmbulanceRequests(Long citizenUserId);
}
