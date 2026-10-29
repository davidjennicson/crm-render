package com.hokma.auth.demo.crm.mapper;

import com.hokma.auth.demo.crm.dto.ContactDto;
import com.hokma.auth.demo.crm.entity.Contact;
import org.springframework.stereotype.Component;

@Component
public class ContactMapperImpl implements ContactMapper {

    @Override
    public Contact toEntity(ContactDto dto) {
        if (dto == null) {
            return null;
        }
        return Contact.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .jobTitle(dto.getJobTitle())
                .address(dto.getAddress())
                .notes(dto.getNotes())
                .status(dto.getStatus() != null ? dto.getStatus() : Contact.ContactStatus.ACTIVE)
                .type(dto.getType() != null ? dto.getType() : Contact.ContactType.INDIVIDUAL)
                .build();
    }

    @Override
    public ContactDto toDto(Contact entity) {
        if (entity == null) {
            return null;
        }
        return ContactDto.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .jobTitle(entity.getJobTitle())
                .address(entity.getAddress())
                .notes(entity.getNotes())
                .status(entity.getStatus())
                .type(entity.getType())
                .companyId(entity.getCompanyEntity() != null ? entity.getCompanyEntity().getId() : null)
                .companyName(entity.getCompanyEntity() != null ? entity.getCompanyEntity().getName() : null)
                .ownerId(entity.getOwner() != null ? entity.getOwner().getId() : null)
                .ownerName(entity.getOwner() != null ? entity.getOwner().getName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
