package com.hokma.auth.demo.crm.service;

import com.hokma.auth.demo.crm.dto.ContactDto;
import com.hokma.auth.demo.crm.entity.Contact.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ContactService {
    ContactDto createContact(ContactDto dto);
    List<ContactDto> bulkCreateContacts(List<ContactDto> dtos);
    ContactDto getContactById(UUID id);
    ContactDto getContactByEmail(String email);
    Page<ContactDto> getAllContacts(Pageable pageable);
    Page<ContactDto> getContactsByStatus(ContactStatus status, Pageable pageable);
    Page<ContactDto> getContactsByOwner(UUID ownerId, Pageable pageable);
    Page<ContactDto> searchContacts(String query, Pageable pageable);
    Page<ContactDto> getFilteredContacts(ContactStatus status, String company, Pageable pageable);
    ContactDto updateContact(UUID id, ContactDto dto);
    void deleteContact(UUID id);
}
