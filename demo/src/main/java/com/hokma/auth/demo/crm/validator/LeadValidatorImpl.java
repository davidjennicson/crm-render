package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.LeadDto;
import com.hokma.auth.demo.crm.entity.Contact;
import com.hokma.auth.demo.crm.entity.Lead;
import com.hokma.auth.demo.crm.repository.ContactRepository;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class LeadValidatorImpl implements LeadValidator {

    private final ContactRepository contactRepository;

    @Override
    public void validateForCreate(LeadDto dto) {
        // Additional create validation rules can go here
    }

    @Override
    public void validateForUpdate(LeadDto dto) {
        // Additional update validation rules can go here
    }

    @Override
    public void validateOwnership(Lead entity, UUID userId) {
        if (entity.getAssignedTo() == null || !entity.getAssignedTo().getId().equals(userId)) {
            // Obfuscate to prevent leaking existence
            throw new ResourceNotFoundException("Lead not found: " + entity.getId());
        }
    }
    
    @Override
    public Contact validateContactAssociation(UUID contactId, UUID userId) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        
        // Ensure user can access the contact they are linking
        if (!contact.getOwner().getId().equals(userId)) {
             throw new ResourceNotFoundException("Contact not found");
        }
        return contact;
    }
}
