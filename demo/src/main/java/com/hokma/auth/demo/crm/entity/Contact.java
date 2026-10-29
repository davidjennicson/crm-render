package com.hokma.auth.demo.crm.entity;

import com.hokma.auth.demo.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String firstName;
    private String lastName;

    @Column(unique = true, length = 320)
    private String email;
    private String phone;
    private String jobTitle;
    private String address;
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ContactStatus status = ContactStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ContactType type = ContactType.INDIVIDUAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company companyEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public enum ContactStatus {
        ACTIVE, INACTIVE, BLOCKED
    }

    public enum ContactType {
        INDIVIDUAL, COMPANY_REPRESENTATIVE
    }
}
