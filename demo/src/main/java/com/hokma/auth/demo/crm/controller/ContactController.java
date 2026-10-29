package com.hokma.auth.demo.crm.controller;

import com.hokma.auth.demo.crm.dto.ContactDto;
import com.hokma.auth.demo.crm.entity.Contact.ContactStatus;
import com.hokma.auth.demo.crm.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.hokma.auth.demo.crm.service.ImportService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@Tag(name = "CRM Contacts")
public class ContactController {

    private final ContactService contactService;
    private final ImportService importService;

    @Operation(summary = "Create a new contact")
    @PostMapping
    public ResponseEntity<ContactDto> createContact(@RequestBody ContactDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.createContact(dto));
    }

    @Operation(summary = "Get a contact by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ContactDto> getContact(@PathVariable UUID id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @Operation(summary = "List all contacts (paginated)")
    @GetMapping
    public ResponseEntity<Page<ContactDto>> getAllContacts(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(contactService.getAllContacts(pageable));
    }

    @Operation(summary = "Search contacts")
    @GetMapping("/search")
    public ResponseEntity<Page<ContactDto>> searchContacts(@RequestParam String query, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(contactService.searchContacts(query, pageable));
    }

    @Operation(summary = "Filter contacts")
    @GetMapping("/filter")
    public ResponseEntity<Page<ContactDto>> filterContacts(
            @RequestParam(required = false) ContactStatus status,
            @RequestParam(required = false) String company,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(contactService.getFilteredContacts(status, company, pageable));
    }

    @Operation(summary = "Update a contact")
    @PutMapping("/{id}")
    public ResponseEntity<ContactDto> updateContact(@PathVariable UUID id, @RequestBody ContactDto dto) {
        return ResponseEntity.ok(contactService.updateContact(id, dto));
    }

    @Operation(summary = "Delete a contact")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable UUID id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Bulk create contacts")
    @PostMapping("/bulk")
    public ResponseEntity<List<ContactDto>> bulkCreateContacts(@RequestBody List<ContactDto> dtos) {
        return ResponseEntity.ok(contactService.bulkCreateContacts(dtos));
    }

    @Operation(summary = "Import contacts from CSV, JSON, or Excel")
    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importContacts(@RequestParam("file") MultipartFile file) {
        try {
            importService.importContacts(file);
            return ResponseEntity.ok("Contacts imported successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to import contacts: " + e.getMessage());
        }
    }
}
