package com.hokma.auth.demo.crm.mapper;

import com.hokma.auth.demo.crm.dto.CompanyDto;
import com.hokma.auth.demo.crm.entity.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapperImpl implements CompanyMapper {

    @Override
    public Company toEntity(CompanyDto dto) {
        if (dto == null) return null;
        return Company.builder()
                .name(dto.getName())
                .website(dto.getWebsite())
                .industry(dto.getIndustry())
                .size(dto.getSize())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .notes(dto.getNotes())
                .build();
    }

    @Override
    public CompanyDto toDto(Company entity) {
        if (entity == null) return null;
        return CompanyDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .website(entity.getWebsite())
                .industry(entity.getIndustry())
                .size(entity.getSize())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .address(entity.getAddress())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
