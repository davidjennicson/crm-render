package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.TaskDto;
import com.hokma.auth.demo.crm.entity.Task;
import com.hokma.auth.demo.crm.repository.TeamRepository;
import com.hokma.auth.demo.auth.repository.UserRepository;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TaskValidatorImpl implements TaskValidator {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    @Override
    public void validateForCreate(TaskDto dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Task title is required");
        }
        if (dto.getAssignedToId() == null) {
            throw new IllegalArgumentException("Task must be assigned to a user");
        }
        validateAssignee(dto.getAssignedToId());
        if (dto.getTeamId() != null) {
            validateTeamAccess(dto.getTeamId(), null);
        }
    }

    @Override
    public void validateForUpdate(TaskDto dto) {
        if (dto.getTitle() != null && dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Task title cannot be blank");
        }
        if (dto.getAssignedToId() != null) {
            validateAssignee(dto.getAssignedToId());
        }
        if (dto.getTeamId() != null) {
            validateTeamAccess(dto.getTeamId(), null);
        }
    }

    @Override
    public void validateOwnership(Task entity, UUID userId) {
        boolean isCreator = entity.getCreatedBy() != null && entity.getCreatedBy().getId().equals(userId);
        boolean isAssigned = entity.getAssignedTo() != null && entity.getAssignedTo().getId().equals(userId);
        boolean isTeamMember = false;
        if (entity.getTeam() != null && entity.getTeam().getMembers() != null) {
            isTeamMember = entity.getTeam().getMembers().stream()
                    .anyMatch(m -> m.getId().equals(userId));
        }
        if (!isCreator && !isAssigned && !isTeamMember) {
            throw new ResourceNotFoundException("Task not found: " + entity.getId());
        }
    }

    @Override
    public void validateAssignee(UUID userId) {
        if (userId == null) return;
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }
    }

    @Override
    public void validateTeamAccess(UUID teamId, UUID userId) {
        if (teamId == null) return;
        var team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + teamId));
        if (userId != null) {
            boolean isMember = team.getOwner().getId().equals(userId)
                    || (team.getMembers() != null && team.getMembers().stream().anyMatch(m -> m.getId().equals(userId)));
            if (!isMember) {
                throw new ResourceNotFoundException("Team not found: " + teamId);
            }
        }
    }
}
