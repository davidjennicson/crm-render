package com.hokma.auth.demo.crm.dto;

import lombok.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamDto {
    private UUID id;
    private String name;
    private String description;
    private UUID ownerId;
    private String ownerName;
    private Set<UUID> memberIds;
    private Set<String> memberNames;
    private Instant createdAt;
}
