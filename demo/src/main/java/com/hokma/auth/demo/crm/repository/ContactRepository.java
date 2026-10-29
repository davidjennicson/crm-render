package com.hokma.auth.demo.crm.repository;

import com.hokma.auth.demo.crm.entity.Contact;
import com.hokma.auth.demo.crm.entity.Contact.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {
    Optional<Contact> findByEmailAndOwner_Id(@Param("email") String email, @Param("ownerId") UUID ownerId);
    boolean existsByEmailAndOwner_Id(@Param("email") String email, @Param("ownerId") UUID ownerId);
    Page<Contact> findByStatusAndOwner_Id(@Param("status") ContactStatus status, @Param("ownerId") UUID ownerId, Pageable pageable);
    Page<Contact> findByOwner_Id(@Param("ownerId") UUID ownerId, Pageable pageable);

    @Query("SELECT c FROM Contact c WHERE c.owner.id = :ownerId AND (" +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(c.companyEntity IS NOT NULL AND LOWER(c.companyEntity.name) LIKE LOWER(CONCAT('%', :query, '%'))))")
    Page<Contact> search(@Param("query") String query, @Param("ownerId") UUID ownerId, Pageable pageable);

    @Query("SELECT c FROM Contact c WHERE c.owner.id = :ownerId AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:company IS NULL OR (c.companyEntity IS NOT NULL AND LOWER(c.companyEntity.name) LIKE LOWER(CONCAT('%', :company, '%'))))")
    Page<Contact> filter(@Param("status") ContactStatus status, @Param("company") String company, @Param("ownerId") UUID ownerId, Pageable pageable);

    long countByStatusAndOwner_Id(@Param("status") ContactStatus status, @Param("ownerId") UUID ownerId);
    long countByOwner_Id(@Param("ownerId") UUID ownerId);
}
