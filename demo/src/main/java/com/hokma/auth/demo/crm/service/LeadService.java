package com.hokma.auth.demo.crm.service;

import com.hokma.auth.demo.crm.dto.LeadDto;
import com.hokma.auth.demo.crm.entity.Lead.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface LeadService {
    LeadDto createLead(LeadDto dto);
    LeadDto getLeadById(UUID id);
    Page<LeadDto> getAllLeads(Pageable pageable);
    Page<LeadDto> getLeadsByStatus(LeadStatus status, Pageable pageable);
    Page<LeadDto> getLeadsByAssignee(UUID userId, Pageable pageable);
    Page<LeadDto> getLeadsByContact(UUID contactId, Pageable pageable);
    LeadDto updateLead(UUID id, LeadDto dto);
    LeadDto updateLeadStatus(UUID id, LeadStatus newStatus);
    void deleteLead(UUID id);

    /** Leads assigned to any member of the given team (current user must be team member or owner). */
    Page<LeadDto> getLeadsForTeam(UUID teamId, Pageable pageable);
}
