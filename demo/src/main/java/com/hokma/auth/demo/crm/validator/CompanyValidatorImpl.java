package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.CompanyDto;
import com.hokma.auth.demo.crm.entity.Company;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CompanyValidatorImpl implements CompanyValidator {

    @Override
    public void validateForCreate(CompanyDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Company name is required");
        }
    }

    @Override
    public void validateForUpdate(CompanyDto dto) {
    }

    @Override
    public void validateOwnership(Company entity, UUID userId) {
        boolean isAuthorized = entity.getAuthorizedUsers().stream()
                .anyMatch(user -> user.getId().equals(userId));
        
        if (!isAuthorized) {
            throw new ResourceNotFoundException("Company not found");
        }
    }
}
