package com.hokma.auth.demo.crm.mapper;

import com.hokma.auth.demo.crm.dto.LeadDto;
import com.hokma.auth.demo.crm.entity.Lead;
import org.springframework.stereotype.Component;

@Component
public class LeadMapperImpl implements LeadMapper {

    @Override
    public Lead toEntity(LeadDto dto) {
        if (dto == null) {
            return null;
        }
        return Lead.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .value(dto.getValue())
                .status(dto.getStatus() != null ? dto.getStatus() : Lead.LeadStatus.NEW)
                .source(dto.getSource())
                .expectedCloseDate(dto.getExpectedCloseDate())
                .notes(dto.getNotes())
                .build();
    }

    @Override
    public LeadDto toDto(Lead entity) {
        if (entity == null) {
            return null;
        }
        return LeadDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .value(entity.getValue())
                .status(entity.getStatus())
                .source(entity.getSource())
                .expectedCloseDate(entity.getExpectedCloseDate())
                .notes(entity.getNotes())
                .contactId(entity.getContact() != null ? entity.getContact().getId() : null)
                .contactName(entity.getContact() != null ? entity.getContact().getFirstName() + " " + entity.getContact().getLastName() : null)
                .assignedToId(entity.getAssignedTo() != null ? entity.getAssignedTo().getId() : null)
                .assignedToName(entity.getAssignedTo() != null ? entity.getAssignedTo().getName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
