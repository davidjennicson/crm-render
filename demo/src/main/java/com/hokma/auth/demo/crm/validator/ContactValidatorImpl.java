package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.ContactDto;
import com.hokma.auth.demo.crm.entity.Company;
import com.hokma.auth.demo.crm.entity.Contact;
import com.hokma.auth.demo.crm.repository.CompanyRepository;
import com.hokma.auth.demo.crm.repository.ContactRepository;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import com.hokma.auth.demo.shared.helper.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ContactValidatorImpl implements ContactValidator {

    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;

    @Override
    public void validateForCreate(ContactDto dto) {
        if (dto.getEmail() != null) {
            validateEmailUniqueness(dto.getEmail());
        }
    }

    @Override
    public void validateForUpdate(ContactDto dto) {
        // Can add update-specific logic here (e.g. checking status transitions)
    }

    @Override
    public void validateOwnership(Contact entity, UUID userId) {
        if (entity.getOwner() == null || !entity.getOwner().getId().equals(userId)) {
            // Obfuscating the error so we don't leak "record exists" info based on ownership
            throw new ResourceNotFoundException("Contact not found");
        }
    }

    @Override
    public void validateEmailUniqueness(String email) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        if (contactRepository.existsByEmailAndOwner_Id(email, userId)) {
            throw new IllegalArgumentException("Contact with this email already exists.");
        }
    }

    @Override
    public Company validateCompanyAssociation(UUID companyId, UUID userId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        
        boolean isAuthorized = company.getAuthorizedUsers().stream()
                .anyMatch(user -> user.getId().equals(userId));
                
        if (!isAuthorized) {
            throw new ResourceNotFoundException("Company not found");
        }
        return company;
    }
}
