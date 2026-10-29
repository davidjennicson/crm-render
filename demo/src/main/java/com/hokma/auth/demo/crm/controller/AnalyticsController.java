package com.hokma.auth.demo.crm.controller;

import com.hokma.auth.demo.crm.dto.AnalyticsDto;
import com.hokma.auth.demo.crm.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "CRM Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Get CRM dashboard analytics")
    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDto> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics());
    }
}
