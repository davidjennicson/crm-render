package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.LeadDto;
import com.hokma.auth.demo.crm.entity.Contact;
import com.hokma.auth.demo.crm.entity.Lead;
import com.hokma.auth.demo.shared.validator.OwnershipValidator;
import com.hokma.auth.demo.shared.validator.Validator;

public interface LeadValidator extends Validator<LeadDto>, OwnershipValidator<Lead> {
    Contact validateContactAssociation(java.util.UUID contactId, java.util.UUID userId);
}
