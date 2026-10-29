package com.hokma.auth.demo.crm.service;

import com.hokma.auth.demo.crm.dto.CompanyDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CompanyService {
    CompanyDto createCompany(CompanyDto dto);
    List<CompanyDto> bulkCreateCompanies(List<CompanyDto> dtos);
    CompanyDto getCompanyById(UUID id);
    Page<CompanyDto> getAllCompanies(Pageable pageable);
    Page<CompanyDto> searchCompanies(String query, Pageable pageable);
    CompanyDto updateCompany(UUID id, CompanyDto dto);
    void deleteCompany(UUID id);
}
