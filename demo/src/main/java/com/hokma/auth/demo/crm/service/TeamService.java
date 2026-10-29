package com.hokma.auth.demo.crm.service;

import com.hokma.auth.demo.crm.dto.TeamDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TeamService {

    TeamDto createTeam(TeamDto dto);

    TeamDto getTeamById(UUID id);

    TeamDto updateTeam(UUID id, TeamDto dto);

    void deleteTeam(UUID id);

    Page<TeamDto> getMyTeams(Pageable pageable);

    /** Teams where current user is owner or member. */
    Page<TeamDto> getTeamsICanAccess(Pageable pageable);

    TeamDto addMember(UUID teamId, UUID userId);

    TeamDto removeMember(UUID teamId, UUID userId);
}
