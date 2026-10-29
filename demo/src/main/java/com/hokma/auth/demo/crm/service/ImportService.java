package com.hokma.auth.demo.crm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hokma.auth.demo.crm.dto.CompanyDto;
import com.hokma.auth.demo.crm.dto.ContactDto;
import com.hokma.auth.demo.crm.entity.Contact.ContactStatus;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final CompanyService companyService;
    private final ContactService contactService;
    private final ObjectMapper objectMapper;

    public void importCompanies(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null) return;
        filename = filename.toLowerCase();

        List<CompanyDto> dtos = new ArrayList<>();

        if (filename.endsWith(".json")) {
            dtos = objectMapper.readValue(file.getInputStream(), new TypeReference<>() {});
        } else if (filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream());
                 CSVParser parser = CSVFormat.Builder.create().setHeader().setIgnoreHeaderCase(true).setTrim(true).build().parse(reader)) {
                for (CSVRecord record : parser) {
                    CompanyDto dto = new CompanyDto();
                    if (record.isMapped("name")) dto.setName(record.get("name"));
                    if (record.isMapped("website")) dto.setWebsite(record.get("website"));
                    if (record.isMapped("industry")) dto.setIndustry(record.get("industry"));
                    if (record.isMapped("size")) dto.setSize(record.get("size"));
                    if (record.isMapped("phone")) dto.setPhone(record.get("phone"));
                    if (record.isMapped("email")) dto.setEmail(record.get("email"));
                    dtos.add(dto);
                }
            }
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                Iterator<Row> rows = sheet.iterator();
                if (rows.hasNext()) {
                    Row headerRow = rows.next();
                    List<String> headers = new ArrayList<>();
                    for (Cell cell : headerRow) {
                        headers.add(cell.getStringCellValue().toLowerCase().trim());
                    }
                    while (rows.hasNext()) {
                        Row currentRow = rows.next();
                        CompanyDto dto = new CompanyDto();
                        for (int i = 0; i < headers.size(); i++) {
                            Cell cell = currentRow.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                            String value = getCellValueAsString(cell);
                            String header = headers.get(i);
                            if (header.equals("name")) dto.setName(value);
                            else if (header.equals("website")) dto.setWebsite(value);
                            else if (header.equals("industry")) dto.setIndustry(value);
                            else if (header.equals("size")) dto.setSize(value);
                            else if (header.equals("phone")) dto.setPhone(value);
                            else if (header.equals("email")) dto.setEmail(value);
                        }
                        if (dto.getName() != null && !dto.getName().isEmpty()) {
                             dtos.add(dto);
                        }
                    }
                }
            }
        } else {
            throw new IllegalArgumentException("Unsupported file type");
        }

        for (CompanyDto dto : dtos) {
            if (dto.getName() != null && !dto.getName().isEmpty()) {
                companyService.createCompany(dto);
            }
        }
    }

    public void importContacts(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null) return;
        filename = filename.toLowerCase();

        List<ContactDto> dtos = new ArrayList<>();

        if (filename.endsWith(".json")) {
            dtos = objectMapper.readValue(file.getInputStream(), new TypeReference<>() {});
        } else if (filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream());
                 CSVParser parser = CSVFormat.Builder.create().setHeader().setIgnoreHeaderCase(true).setTrim(true).build().parse(reader)) {
                for (CSVRecord record : parser) {
                    ContactDto dto = new ContactDto();
                    if (record.isMapped("firstname")) dto.setFirstName(record.get("firstname"));
                    if (record.isMapped("lastname")) dto.setLastName(record.get("lastname"));
                    if (record.isMapped("email")) dto.setEmail(record.get("email"));
                    if (record.isMapped("phone")) dto.setPhone(record.get("phone"));
                    if (record.isMapped("jobtitle")) dto.setJobTitle(record.get("jobtitle"));
                    dto.setStatus(ContactStatus.ACTIVE);
                    dtos.add(dto);
                }
            }
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                Iterator<Row> rows = sheet.iterator();
                if (rows.hasNext()) {
                    Row headerRow = rows.next();
                    List<String> headers = new ArrayList<>();
                    for (Cell cell : headerRow) {
                        headers.add(cell.getStringCellValue().toLowerCase().trim().replace(" ", ""));
                    }
                    while (rows.hasNext()) {
                        Row currentRow = rows.next();
                        ContactDto dto = new ContactDto();
                        for (int i = 0; i < headers.size(); i++) {
                            Cell cell = currentRow.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                            String value = getCellValueAsString(cell);
                            String header = headers.get(i);
                            if (header.contains("firstname")) dto.setFirstName(value);
                            else if (header.contains("lastname")) dto.setLastName(value);
                            else if (header.contains("email")) dto.setEmail(value);
                            else if (header.contains("phone")) dto.setPhone(value);
                            else if (header.contains("jobtitle") || header.contains("role")) dto.setJobTitle(value);
                        }
                        dto.setStatus(ContactStatus.ACTIVE);
                        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
                             dtos.add(dto);
                        }
                    }
                }
            }
        } else {
            throw new IllegalArgumentException("Unsupported file type");
        }

        for (ContactDto dto : dtos) {
            if (dto.getFirstName() != null && dto.getEmail() != null) {
                try {
                    contactService.createContact(dto);
                } catch (Exception e) {
                   // Ignore duplicates or constraints for simplicity in batch import
                }
            }
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
