package com.hokma.auth.demo.crm.controller;

import com.hokma.auth.demo.crm.dto.LeadDto;
import com.hokma.auth.demo.crm.entity.Lead.LeadStatus;
import com.hokma.auth.demo.crm.service.LeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
@Tag(name = "CRM Leads")
public class LeadController {

    private final LeadService leadService;

    @Operation(summary = "Create a new lead")
    @PostMapping
    public ResponseEntity<LeadDto> createLead(@RequestBody LeadDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(dto));
    }

    @Operation(summary = "Get a lead by ID")
    @GetMapping("/{id}")
    public ResponseEntity<LeadDto> getLead(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getLeadById(id));
    }

    @Operation(summary = "List all leads")
    @GetMapping
    public ResponseEntity<Page<LeadDto>> getAllLeads(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leadService.getAllLeads(pageable));
    }

    @Operation(summary = "Update a lead")
    @PutMapping("/{id}")
    public ResponseEntity<LeadDto> updateLead(@PathVariable UUID id, @RequestBody LeadDto dto) {
        return ResponseEntity.ok(leadService.updateLead(id, dto));
    }

    @Operation(summary = "Update lead status")
    @PatchMapping("/{id}/status")
    public ResponseEntity<LeadDto> updateStatus(@PathVariable UUID id, @RequestParam LeadStatus status) {
        return ResponseEntity.ok(leadService.updateLeadStatus(id, status));
    }

    @Operation(summary = "Delete a lead")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get leads for a team (pipeline visible to team)")
    @GetMapping("/team/{teamId}")
    public ResponseEntity<Page<LeadDto>> getLeadsForTeam(
            @PathVariable UUID teamId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leadService.getLeadsForTeam(teamId, pageable));
    }
}
