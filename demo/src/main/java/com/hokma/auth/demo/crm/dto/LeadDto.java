package com.hokma.auth.demo.crm.dto;

import com.hokma.auth.demo.crm.entity.Lead.LeadStatus;
import com.hokma.auth.demo.crm.entity.Lead.LeadSource;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadDto {
    private UUID id;
    private String title;
    private String description;
    private BigDecimal value;
    private LeadStatus status;
    private LeadSource source;
    private LocalDate expectedCloseDate;
    private String notes;
    private UUID contactId;
    private String contactName;
    private UUID assignedToId;
    private String assignedToName;
    private Instant createdAt;
    private Instant updatedAt;
}
