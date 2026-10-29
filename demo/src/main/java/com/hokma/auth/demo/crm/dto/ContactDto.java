package com.hokma.auth.demo.crm.dto;

import com.hokma.auth.demo.crm.entity.Contact.ContactStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String company;
    private String jobTitle;
    private String address;
    private String notes;
    private ContactStatus status;
    private com.hokma.auth.demo.crm.entity.Contact.ContactType type;
    private UUID companyId;
    private String companyName;
    private UUID ownerId;
    private String ownerName;
    private Instant createdAt;
    private Instant updatedAt;
}
