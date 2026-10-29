package com.hokma.auth.demo.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hokma.auth.demo.auth.entity.Provider;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    private UUID id;
    private String email;
    private String name;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String image;
    @Builder.Default
    private Boolean enable = true;
    private Instant createdAt;
    private Instant updateAt;
    private String gender;
    private String address;
    private String companyName;
    private String industry;
    private String companySize;
    private String role;
    @Builder.Default
    private Boolean setupCompleted = false;
    private Provider provider;
    
    @Builder.Default
    private Set<RoleDto> roles = new HashSet<>();
}
