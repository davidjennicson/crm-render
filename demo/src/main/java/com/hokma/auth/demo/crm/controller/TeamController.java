package com.hokma.auth.demo.crm.controller;

import com.hokma.auth.demo.crm.dto.TeamDto;
import com.hokma.auth.demo.crm.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
@Tag(name = "CRM Teams")
public class TeamController {

    private final TeamService teamService;

    @Operation(summary = "Create a team")
    @PostMapping
    public ResponseEntity<TeamDto> createTeam(@RequestBody TeamDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(dto));
    }

    @Operation(summary = "Get team by ID")
    @GetMapping("/{id}")
    public ResponseEntity<TeamDto> getTeam(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @Operation(summary = "Update a team")
    @PutMapping("/{id}")
    public ResponseEntity<TeamDto> updateTeam(@PathVariable("id") UUID id, @RequestBody TeamDto dto) {
        return ResponseEntity.ok(teamService.updateTeam(id, dto));
    }

    @Operation(summary = "Delete a team")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable("id") UUID id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get teams I own")
    @GetMapping("/my")
    public ResponseEntity<org.springframework.data.domain.Page<TeamDto>> getMyTeams(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(teamService.getMyTeams(org.springframework.data.domain.PageRequest.of(page, size)));
    }

    @Operation(summary = "Get teams I can access (owner or member)")
    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<TeamDto>> getTeamsICanAccess(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(teamService.getTeamsICanAccess(org.springframework.data.domain.PageRequest.of(page, size)));
    }

    @Operation(summary = "Add member to team")
    @PostMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamDto> addMember(@PathVariable("teamId") UUID teamId, @PathVariable("userId") UUID userId) {
        return ResponseEntity.ok(teamService.addMember(teamId, userId));
    }

    @Operation(summary = "Remove member from team")
    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamDto> removeMember(@PathVariable("teamId") UUID teamId, @PathVariable("userId") UUID userId) {
        return ResponseEntity.ok(teamService.removeMember(teamId, userId));
    }
}
