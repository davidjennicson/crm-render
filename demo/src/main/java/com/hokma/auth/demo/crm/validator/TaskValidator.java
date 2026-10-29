package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.TaskDto;
import com.hokma.auth.demo.crm.entity.Task;
import com.hokma.auth.demo.shared.validator.OwnershipValidator;
import com.hokma.auth.demo.shared.validator.Validator;

import java.util.UUID;

public interface TaskValidator extends Validator<TaskDto>, OwnershipValidator<Task> {
    void validateAssignee(UUID userId);
    void validateTeamAccess(UUID teamId, UUID userId);
}
