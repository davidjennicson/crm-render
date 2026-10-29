package com.hokma.auth.demo.crm.service.impl;

import com.hokma.auth.demo.crm.dto.AnalyticsDto;
import com.hokma.auth.demo.crm.entity.Contact.ContactStatus;
import com.hokma.auth.demo.crm.entity.Lead.LeadStatus;
import com.hokma.auth.demo.crm.repository.ContactRepository;
import com.hokma.auth.demo.crm.repository.LeadRepository;
import com.hokma.auth.demo.crm.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ContactRepository contactRepository;
    private final LeadRepository leadRepository;

    @Override
    public AnalyticsDto getDashboardAnalytics() {
        try {
            java.util.UUID userId = com.hokma.auth.demo.shared.helper.SecurityHelper.getAuthenticatedUserId();
            
            long totalLeads = leadRepository.countByAssignedTo_Id(userId);
            long wonLeads = leadRepository.countByStatusAndAssignedTo_Id(LeadStatus.WON, userId);
            double conversionRate = totalLeads > 0 ? (double) wonLeads / totalLeads * 100 : 0;

            Map<String, Long> leadsByStatus = new LinkedHashMap<>();
            for (Object[] row : leadRepository.countGroupByStatus(userId)) {
                if (row != null && row.length >= 2 && row[0] != null) {
                    leadsByStatus.put(row[0].toString(), ((Number) row[1]).longValue());
                }
            }

            Map<String, Long> leadsBySource = new LinkedHashMap<>();
            for (Object[] row : leadRepository.countGroupBySource(userId)) {
                if (row != null && row.length >= 2 && row[0] != null) {
                    leadsBySource.put(row[0].toString(), ((Number) row[1]).longValue());
                }
            }

            Map<String, Long> contactsByStatus = new LinkedHashMap<>();
            contactsByStatus.put("ACTIVE", contactRepository.countByStatusAndOwner_Id(ContactStatus.ACTIVE, userId));
            contactsByStatus.put("INACTIVE", contactRepository.countByStatusAndOwner_Id(ContactStatus.INACTIVE, userId));
            contactsByStatus.put("BLOCKED", contactRepository.countByStatusAndOwner_Id(ContactStatus.BLOCKED, userId));

            BigDecimal pipelineValue = leadRepository.sumPipelineValue(userId);
            BigDecimal wonValue = leadRepository.sumWonValue(userId);

            return AnalyticsDto.builder()
                    .totalContacts(contactRepository.countByOwner_Id(userId))
                    .activeContacts(contactRepository.countByStatusAndOwner_Id(ContactStatus.ACTIVE, userId))
                    .inactiveContacts(contactRepository.countByStatusAndOwner_Id(ContactStatus.INACTIVE, userId))
                    .totalLeads(totalLeads)
                    .newLeads(leadRepository.countByStatusAndAssignedTo_Id(LeadStatus.NEW, userId))
                    .wonLeads(wonLeads)
                    .lostLeads(leadRepository.countByStatusAndAssignedTo_Id(LeadStatus.LOST, userId))
                    .openLeads(totalLeads - wonLeads - leadRepository.countByStatusAndAssignedTo_Id(LeadStatus.LOST, userId))
                    .totalPipelineValue(pipelineValue != null ? pipelineValue : BigDecimal.ZERO)
                    .totalWonValue(wonValue != null ? wonValue : BigDecimal.ZERO)
                    .conversionRate(BigDecimal.valueOf(conversionRate).setScale(2, RoundingMode.HALF_UP).doubleValue())
                    .leadsByStatus(leadsByStatus)
                    .leadsBySource(leadsBySource)
                    .contactsByStatus(contactsByStatus)
                    .totalUsers(0)
                    .build();
        } catch (Exception e) {
            System.err.println("Error fetching dashboard analytics: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
