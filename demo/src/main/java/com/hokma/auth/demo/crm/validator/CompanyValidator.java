package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.CompanyDto;
import com.hokma.auth.demo.crm.entity.Company;
import com.hokma.auth.demo.shared.validator.OwnershipValidator;
import com.hokma.auth.demo.shared.validator.Validator;

public interface CompanyValidator extends Validator<CompanyDto>, OwnershipValidator<Company> {
}
