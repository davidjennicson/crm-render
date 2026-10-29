package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.ContactDto;
import com.hokma.auth.demo.crm.entity.Contact;
import com.hokma.auth.demo.shared.validator.OwnershipValidator;
import com.hokma.auth.demo.shared.validator.Validator;

import java.util.UUID;

public interface ContactValidator extends Validator<ContactDto>, OwnershipValidator<Contact> {
    void validateEmailUniqueness(String email);
    com.hokma.auth.demo.crm.entity.Company validateCompanyAssociation(UUID companyId, UUID userId);
}
