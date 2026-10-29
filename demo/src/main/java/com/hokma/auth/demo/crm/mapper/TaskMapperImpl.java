package com.hokma.auth.demo.crm.mapper;

import com.hokma.auth.demo.crm.dto.TaskDto;
import com.hokma.auth.demo.crm.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapperImpl implements TaskMapper {

    @Override
    public Task toEntity(TaskDto dto) {
        if (dto == null) return null;
        return Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .status(dto.getStatus() != null ? dto.getStatus() : Task.TaskStatus.PENDING)
                .priority(dto.getPriority() != null ? dto.getPriority() : Task.TaskPriority.MEDIUM)
                .build();
    }

    @Override
    public TaskDto toDto(Task entity) {
        if (entity == null) return null;
        return TaskDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .dueDate(entity.getDueDate())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .assignedToId(entity.getAssignedTo() != null ? entity.getAssignedTo().getId() : null)
                .assignedToName(entity.getAssignedTo() != null ? entity.getAssignedTo().getName() : null)
                .leadId(entity.getLead() != null ? entity.getLead().getId() : null)
                .leadTitle(entity.getLead() != null ? entity.getLead().getTitle() : null)
                .teamId(entity.getTeam() != null ? entity.getTeam().getId() : null)
                .teamName(entity.getTeam() != null ? entity.getTeam().getName() : null)
                .createdById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null)
                .createdByName(entity.getCreatedBy() != null ? entity.getCreatedBy().getName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
