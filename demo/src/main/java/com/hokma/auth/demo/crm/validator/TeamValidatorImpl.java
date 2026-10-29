package com.hokma.auth.demo.crm.validator;

import com.hokma.auth.demo.crm.dto.TeamDto;
import com.hokma.auth.demo.crm.entity.Team;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TeamValidatorImpl implements TeamValidator {

    @Override
    public void validateForCreate(TeamDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Team name is required");
        }
    }

    @Override
    public void validateForUpdate(TeamDto dto) {
        if (dto.getName() != null && dto.getName().isBlank()) {
            throw new IllegalArgumentException("Team name cannot be blank");
        }
    }

    @Override
    public void validateOwnership(Team entity, UUID userId) {
        boolean isOwner = entity.getOwner() != null && entity.getOwner().getId().equals(userId);
        boolean isMember = entity.getMembers() != null && entity.getMembers().stream()
                .anyMatch(m -> m.getId().equals(userId));
        if (!isOwner && !isMember) {
            throw new ResourceNotFoundException("Team not found: " + entity.getId());
        }
    }

    @Override
    public void validateMemberAddition(UUID teamId, UUID userIdToAdd, UUID requestingUserId) {
        // Can be used by service to ensure only owner/admin can add members
    }
}
