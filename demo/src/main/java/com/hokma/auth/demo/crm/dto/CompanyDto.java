package com.hokma.auth.demo.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {
    private UUID id;
    private String name;
    private String website;
    private String industry;
    private String size;
    private String phone;
    private String email;
    private String address;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
