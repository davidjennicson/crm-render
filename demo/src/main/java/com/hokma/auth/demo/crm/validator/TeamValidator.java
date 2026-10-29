package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.TeamDto;
import com.hokma.auth.demo.crm.entity.Team;
import com.hokma.auth.demo.shared.validator.OwnershipValidator;
import com.hokma.auth.demo.shared.validator.Validator;

import java.util.UUID;

public interface TeamValidator extends Validator<TeamDto>, OwnershipValidator<Team> {
    void validateMemberAddition(UUID teamId, UUID userIdToAdd, UUID requestingUserId);
}
