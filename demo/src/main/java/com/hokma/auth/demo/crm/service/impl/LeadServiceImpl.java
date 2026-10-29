package com.hokma.auth.demo.crm.service.impl;

import com.hokma.auth.demo.crm.dto.LeadDto;
import com.hokma.auth.demo.crm.entity.Contact;
import com.hokma.auth.demo.crm.entity.Lead;
import com.hokma.auth.demo.crm.entity.Lead.LeadStatus;
import com.hokma.auth.demo.crm.mapper.LeadMapper;
import com.hokma.auth.demo.crm.repository.LeadRepository;
import com.hokma.auth.demo.crm.repository.TeamRepository;
import com.hokma.auth.demo.crm.service.LeadService;
import com.hokma.auth.demo.crm.validator.LeadValidator;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import com.hokma.auth.demo.shared.helper.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeadServiceImpl implements LeadService {

    private final LeadRepository leadRepository;
    private final LeadMapper leadMapper;
    private final LeadValidator leadValidator;
    private final TeamRepository teamRepository;

    @Override
    @Transactional
    public LeadDto createLead(LeadDto dto) {
        leadValidator.validateForCreate(dto);
        Lead lead = leadMapper.toEntity(dto);
        lead.setAssignedTo(SecurityHelper.getCurrentUser());
        
        if (dto.getContactId() != null) {
            UUID userId = SecurityHelper.getAuthenticatedUserId();
            Contact contact = leadValidator.validateContactAssociation(dto.getContactId(), userId);
            lead.setContact(contact);
        }
        
        return leadMapper.toDto(leadRepository.save(lead));
    }

    @Override
    public LeadDto getLeadById(UUID id) {
        return leadMapper.toDto(findOrThrow(id));
    }

    @Override
    public Page<LeadDto> getAllLeads(Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return leadRepository.findByAssignedTo_Id(userId, pageable).map(leadMapper::toDto);
    }

    @Override
    public Page<LeadDto> getLeadsByStatus(LeadStatus status, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return leadRepository.findByStatusAndAssignedTo_Id(status, userId, pageable).map(leadMapper::toDto);
    }

    @Override
    public Page<LeadDto> getLeadsByAssignee(UUID userId, Pageable pageable) {
        UUID authUserId = SecurityHelper.getAuthenticatedUserId();
        return leadRepository.findByAssignedTo_Id(authUserId, pageable).map(leadMapper::toDto);
    }

    @Override
    public Page<LeadDto> getLeadsByContact(UUID contactId, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return leadRepository.findByContact_IdAndAssignedTo_Id(contactId, userId, pageable).map(leadMapper::toDto);
    }

    @Override
    @Transactional
    public LeadDto updateLead(UUID id, LeadDto dto) {
        leadValidator.validateForUpdate(dto);
        Lead existing = findOrThrow(id);
        
        if (dto.getTitle() != null) existing.setTitle(dto.getTitle());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getValue() != null) existing.setValue(dto.getValue());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
        if (dto.getSource() != null) existing.setSource(dto.getSource());
        if (dto.getExpectedCloseDate() != null) existing.setExpectedCloseDate(dto.getExpectedCloseDate());
        if (dto.getNotes() != null) existing.setNotes(dto.getNotes());
        
        if (dto.getContactId() != null) {
            UUID userId = SecurityHelper.getAuthenticatedUserId();
            Contact contact = leadValidator.validateContactAssociation(dto.getContactId(), userId);
            existing.setContact(contact);
        }
        
        return leadMapper.toDto(leadRepository.save(existing));
    }

    @Override
    @Transactional
    public LeadDto updateLeadStatus(UUID id, LeadStatus newStatus) {
        Lead lead = findOrThrow(id);
        lead.setStatus(newStatus);
        return leadMapper.toDto(leadRepository.save(lead));
    }

    @Override
    @Transactional
    public void deleteLead(UUID id) {
        leadRepository.delete(findOrThrow(id));
    }

    @Override
    public Page<LeadDto> getLeadsForTeam(UUID teamId, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        var team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + teamId));
        boolean isOwner = team.getOwner() != null && team.getOwner().getId().equals(userId);
        boolean isMember = team.getMembers() != null && team.getMembers().stream().anyMatch(m -> m.getId().equals(userId));
        if (!isOwner && !isMember) {
            throw new ResourceNotFoundException("Team not found: " + teamId);
        }
        Set<UUID> memberIds = new HashSet<>();
        if (team.getOwner() != null) memberIds.add(team.getOwner().getId());
        if (team.getMembers() != null) {
            team.getMembers().stream().map(u -> u.getId()).forEach(memberIds::add);
        }
        return leadRepository.findByAssignedTo_IdIn(memberIds, pageable).map(leadMapper::toDto);
    }

    private Lead findOrThrow(UUID id) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
        
        leadValidator.validateOwnership(lead, userId);
        return lead;
    }
}
