package com.hokma.auth.demo.crm.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDto {
    private long totalContacts;
    private long activeContacts;
    private long inactiveContacts;
    private long totalLeads;
    private long newLeads;
    private long wonLeads;
    private long lostLeads;
    private long openLeads;
    private BigDecimal totalPipelineValue;
    private BigDecimal totalWonValue;
    private double conversionRate;
    private Map<String, Long> leadsByStatus;
    private Map<String, Long> leadsBySource;
    private Map<String, Long> contactsByStatus;
    private long totalUsers;
}
