package com.hokma.auth.demo.crm.controller;

import com.hokma.auth.demo.crm.dto.CompanyDto;
import com.hokma.auth.demo.crm.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.hokma.auth.demo.crm.service.ImportService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
@Tag(name = "CRM Companies")
public class CompanyController {

    private final CompanyService companyService;
    private final ImportService importService;

    @Operation(summary = "Create a new company")
    @PostMapping
    public ResponseEntity<CompanyDto> createCompany(@RequestBody CompanyDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.createCompany(dto));
    }

    @Operation(summary = "Get a company by ID")
    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto> getCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @Operation(summary = "List all companies (paginated)")
    @GetMapping
    public ResponseEntity<Page<CompanyDto>> getAllCompanies(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(companyService.getAllCompanies(pageable));
    }

    @Operation(summary = "Search companies")
    @GetMapping("/search")
    public ResponseEntity<Page<CompanyDto>> searchCompanies(@RequestParam String query, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(companyService.searchCompanies(query, pageable));
    }

    @Operation(summary = "Update a company")
    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> updateCompany(@PathVariable UUID id, @RequestBody CompanyDto dto) {
        return ResponseEntity.ok(companyService.updateCompany(id, dto));
    }

    @Operation(summary = "Delete a company")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Bulk create companies")
    @PostMapping("/bulk")
    public ResponseEntity<List<CompanyDto>> bulkCreateCompanies(@RequestBody List<CompanyDto> dtos) {
        return ResponseEntity.ok(companyService.bulkCreateCompanies(dtos));
    }

    @Operation(summary = "Import companies from CSV, JSON, or Excel")
    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importCompanies(@RequestParam("file") MultipartFile file) {
        try {
            importService.importCompanies(file);
            return ResponseEntity.ok("Companies imported successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to import companies: " + e.getMessage());
        }
    }
}
