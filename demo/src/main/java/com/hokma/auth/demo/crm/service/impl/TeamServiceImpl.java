package com.hokma.auth.demo.crm.service.impl;

import com.hokma.auth.demo.crm.dto.TeamDto;
import com.hokma.auth.demo.crm.entity.Team;
import com.hokma.auth.demo.crm.mapper.TeamMapper;
import com.hokma.auth.demo.crm.repository.TeamRepository;
import com.hokma.auth.demo.crm.service.TeamService;
import com.hokma.auth.demo.crm.validator.TeamValidator;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import com.hokma.auth.demo.shared.helper.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMapper teamMapper;
    private final TeamValidator teamValidator;
    private final com.hokma.auth.demo.auth.repository.UserRepository userRepository;

    @Override
    @Transactional
    public TeamDto createTeam(TeamDto dto) {
        teamValidator.validateForCreate(dto);
        var currentUser = SecurityHelper.getCurrentUser();
        Team team = teamMapper.toEntity(dto);
        team.setOwner(currentUser);
        team.setMembers(new HashSet<>());
        team.getMembers().add(currentUser);
        return teamMapper.toDto(teamRepository.save(team));
    }

    @Override
    public TeamDto getTeamById(UUID id) {
        Team team = teamRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Team not found: " + id));
        teamValidator.validateOwnership(team, SecurityHelper.getAuthenticatedUserId());
        return teamMapper.toDto(team);
    }

    @Override
    @Transactional
    public TeamDto updateTeam(UUID id, TeamDto dto) {
        teamValidator.validateForUpdate(dto);
        Team existing = teamRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Team not found: " + id));
        if (!existing.getOwner().getId().equals(SecurityHelper.getAuthenticatedUserId())) {
            throw new ResourceNotFoundException("Team not found: " + id);
        }
        if (dto.getName() != null) existing.setName(dto.getName());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        return teamMapper.toDto(teamRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteTeam(UUID id) {
        Team team = teamRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Team not found: " + id));
        if (!team.getOwner().getId().equals(SecurityHelper.getAuthenticatedUserId())) {
            throw new ResourceNotFoundException("Team not found: " + id);
        }
        teamRepository.delete(team);
    }

    @Override
    public Page<TeamDto> getMyTeams(Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return teamRepository.findByOwner_Id(userId, pageable).map(teamMapper::toDto);
    }

    @Override
    public Page<TeamDto> getTeamsICanAccess(Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        return teamRepository.findByMemberOrOwner(userId, pageable).map(teamMapper::toDto);
    }

    @Override
    @Transactional
    public TeamDto addMember(UUID teamId, UUID userId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new ResourceNotFoundException("Team not found: " + teamId));
        if (!team.getOwner().getId().equals(SecurityHelper.getAuthenticatedUserId())) {
            throw new ResourceNotFoundException("Team not found: " + teamId);
        }
        var user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        team.getMembers().add(user);
        return teamMapper.toDto(teamRepository.save(team));
    }

    @Override
    @Transactional
    public TeamDto removeMember(UUID teamId, UUID userId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new ResourceNotFoundException("Team not found: " + teamId));
        UUID currentUserId = SecurityHelper.getAuthenticatedUserId();
        if (!team.getOwner().getId().equals(currentUserId) && !userId.equals(currentUserId)) {
            throw new ResourceNotFoundException("Team not found: " + teamId);
        }
        team.getMembers().removeIf(m -> m.getId().equals(userId));
        if (team.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot remove team owner");
        }
        return teamMapper.toDto(teamRepository.save(team));
    }
}
