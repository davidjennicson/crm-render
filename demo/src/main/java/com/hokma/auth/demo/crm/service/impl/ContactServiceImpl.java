package com.hokma.auth.demo.crm.service.impl;

import com.hokma.auth.demo.crm.dto.ContactDto;
import com.hokma.auth.demo.crm.entity.Contact;
import com.hokma.auth.demo.crm.entity.Contact.ContactStatus;
import com.hokma.auth.demo.crm.mapper.ContactMapper;
import com.hokma.auth.demo.crm.repository.ContactRepository;
import com.hokma.auth.demo.crm.service.ContactService;
import com.hokma.auth.demo.crm.validator.ContactValidator;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import com.hokma.auth.demo.shared.helper.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;
    private final ContactValidator contactValidator;

    @Override
    @Transactional
    public ContactDto createContact(ContactDto dto) {
        contactValidator.validateForCreate(dto);
        Contact contact = contactMapper.toEntity(dto);
        contact.setOwner(SecurityHelper.getCurrentUser());
        return contactMapper.toDto(contactRepository.save(contact));
    }

    @Override
    @Transactional
    public List<ContactDto> bulkCreateContacts(List<ContactDto> dtos) {
        return dtos.stream()
                .map(this::createContact)
                .collect(Collectors.toList());
    }

    @Override
    public ContactDto getContactById(UUID id) {
        return contactMapper.toDto(findOrThrow(id));
    }

    @Override
    public ContactDto getContactByEmail(String email) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        Contact contact = contactRepository.findByEmailAndOwner_Id(email, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with email: " + email));
        return contactMapper.toDto(contact);
    }

    @Override
    public Page<ContactDto> getAllContacts(Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return contactRepository.findByOwner_Id(userId, pageable).map(contactMapper::toDto);
    }

    @Override
    public Page<ContactDto> getContactsByStatus(ContactStatus status, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return contactRepository.findByStatusAndOwner_Id(status, userId, pageable).map(contactMapper::toDto);
    }

    @Override
    public Page<ContactDto> getContactsByOwner(UUID ownerId, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return contactRepository.findByOwner_Id(userId, pageable).map(contactMapper::toDto);
    }

    @Override
    public Page<ContactDto> searchContacts(String query, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return contactRepository.search(query, userId, pageable).map(contactMapper::toDto);
    }

    @Override
    public Page<ContactDto> getFilteredContacts(ContactStatus status, String company, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return contactRepository.filter(status, company, userId, pageable).map(contactMapper::toDto);
    }

    @Override
    @Transactional
    public ContactDto updateContact(UUID id, ContactDto dto) {
        contactValidator.validateForUpdate(dto);
        Contact existing = findOrThrow(id);
        
        if (dto.getFirstName() != null) existing.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) existing.setLastName(dto.getLastName());
        if (dto.getEmail() != null) existing.setEmail(dto.getEmail());
        if (dto.getPhone() != null) existing.setPhone(dto.getPhone());
        if (dto.getJobTitle() != null) existing.setJobTitle(dto.getJobTitle());
        if (dto.getAddress() != null) existing.setAddress(dto.getAddress());
        if (dto.getNotes() != null) existing.setNotes(dto.getNotes());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
        if (dto.getType() != null) existing.setType(dto.getType());

        if (dto.getCompanyId() != null) {
            UUID userId = SecurityHelper.getAuthenticatedUserId();
            existing.setCompanyEntity(contactValidator.validateCompanyAssociation(dto.getCompanyId(), userId));
        } else if (dto.getCompanyName() == null && dto.getCompanyId() == null) {
             // If both are null, maybe clear association? Or leave as is.
             // Usually depends on if it's a patch or full update.
        }

        return contactMapper.toDto(contactRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteContact(UUID id) {
        contactRepository.delete(findOrThrow(id));
    }

    private Contact findOrThrow(UUID id) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + id));
        
        contactValidator.validateOwnership(contact, userId);
        return contact;
    }
}

