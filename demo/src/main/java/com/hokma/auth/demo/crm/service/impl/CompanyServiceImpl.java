package com.hokma.auth.demo.crm.service.impl;

import com.hokma.auth.demo.crm.dto.CompanyDto;
import com.hokma.auth.demo.crm.entity.Company;
import com.hokma.auth.demo.crm.mapper.CompanyMapper;
import com.hokma.auth.demo.crm.repository.CompanyRepository;
import com.hokma.auth.demo.crm.service.CompanyService;
import com.hokma.auth.demo.crm.validator.CompanyValidator;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import com.hokma.auth.demo.shared.helper.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final CompanyValidator companyValidator;

    @Override
    @Transactional
    public CompanyDto createCompany(CompanyDto dto) {
        companyValidator.validateForCreate(dto);
        Company company = companyMapper.toEntity(dto);
        company.getAuthorizedUsers().add(SecurityHelper.getCurrentUser());
        return companyMapper.toDto(companyRepository.save(company));
    }

    @Override
    @Transactional
    public List<CompanyDto> bulkCreateCompanies(List<CompanyDto> dtos) {
        return dtos.stream()
                .map(this::createCompany)
                .collect(Collectors.toList());
    }

    @Override
    public CompanyDto getCompanyById(UUID id) {
        return companyMapper.toDto(findOrThrow(id));
    }

    @Override
    public Page<CompanyDto> getAllCompanies(Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return companyRepository.findByAuthorizedUser(userId, pageable).map(companyMapper::toDto);
    }

    @Override
    public Page<CompanyDto> searchCompanies(String query, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return companyRepository.search(query, userId, pageable).map(companyMapper::toDto);
    }

    @Override
    @Transactional
    public CompanyDto updateCompany(UUID id, CompanyDto dto) {
        companyValidator.validateForUpdate(dto);
        Company existing = findOrThrow(id);

        if (dto.getName() != null) existing.setName(dto.getName());
        if (dto.getWebsite() != null) existing.setWebsite(dto.getWebsite());
        if (dto.getIndustry() != null) existing.setIndustry(dto.getIndustry());
        if (dto.getSize() != null) existing.setSize(dto.getSize());
        if (dto.getPhone() != null) existing.setPhone(dto.getPhone());
        if (dto.getEmail() != null) existing.setEmail(dto.getEmail());
        if (dto.getAddress() != null) existing.setAddress(dto.getAddress());
        if (dto.getNotes() != null) existing.setNotes(dto.getNotes());

        return companyMapper.toDto(companyRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteCompany(UUID id) {
        companyRepository.delete(findOrThrow(id));
    }

    private Company findOrThrow(UUID id) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        companyValidator.validateOwnership(company, userId);
        return company;
    }
}
