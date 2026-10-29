package com.hokma.auth.demo.crm.mapper;

import com.hokma.auth.demo.crm.dto.TeamDto;
import com.hokma.auth.demo.crm.entity.Team;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TeamMapperImpl implements TeamMapper {

    @Override
    public Team toEntity(TeamDto dto) {
        if (dto == null) return null;
        return Team.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }

    @Override
    public TeamDto toDto(Team entity) {
        if (entity == null) return null;
        return TeamDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .ownerId(entity.getOwner() != null ? entity.getOwner().getId() : null)
                .ownerName(entity.getOwner() != null ? entity.getOwner().getName() : null)
                .memberIds(entity.getMembers() != null
                        ? entity.getMembers().stream().map(m -> m.getId()).collect(Collectors.toSet())
                        : null)
                .memberNames(entity.getMembers() != null
                        ? entity.getMembers().stream().map(m -> m.getName()).collect(Collectors.toSet())
                        : null)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
