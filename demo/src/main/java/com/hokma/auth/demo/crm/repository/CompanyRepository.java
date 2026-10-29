package com.hokma.auth.demo.crm.repository;

import com.hokma.auth.demo.crm.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    
    @Query("SELECT c FROM Company c JOIN c.authorizedUsers u WHERE u.id = :userId")
    Page<Company> findByAuthorizedUser(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT c FROM Company c JOIN c.authorizedUsers u WHERE u.id = :userId AND (" +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.industry) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Company> search(@Param("query") String query, @Param("userId") UUID userId, Pageable pageable);
}
