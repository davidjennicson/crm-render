package com.hokma.auth.demo.crm.repository;

import com.hokma.auth.demo.crm.entity.Lead;
import com.hokma.auth.demo.crm.entity.Lead.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface LeadRepository extends JpaRepository<Lead, UUID> {
    Page<Lead> findByStatusAndAssignedTo_Id(@Param("status") LeadStatus status, @Param("userId") UUID userId, Pageable pageable);
    Page<Lead> findByAssignedTo_Id(@Param("userId") UUID userId, Pageable pageable);
    Page<Lead> findByAssignedTo_IdIn(@Param("userIds") Collection<UUID> userIds, Pageable pageable);
    Page<Lead> findByContact_IdAndAssignedTo_Id(@Param("contactId") UUID contactId, @Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(l.value), 0.0) FROM Lead l WHERE l.assignedTo.id = :userId AND l.status NOT IN ('WON', 'LOST')")
    BigDecimal sumPipelineValue(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(l.value), 0.0) FROM Lead l WHERE l.assignedTo.id = :userId AND l.status = 'WON'")
    BigDecimal sumWonValue(@Param("userId") UUID userId);

    @Query("SELECT l.status, COUNT(l) FROM Lead l WHERE l.assignedTo.id = :userId GROUP BY l.status")
    List<Object[]> countGroupByStatus(@Param("userId") UUID userId);

    @Query("SELECT l.source, COUNT(l) FROM Lead l WHERE l.assignedTo.id = :userId AND l.source IS NOT NULL GROUP BY l.source")
    List<Object[]> countGroupBySource(@Param("userId") UUID userId);

    long countByStatusAndAssignedTo_Id(@Param("status") LeadStatus status, @Param("userId") UUID userId);
    long countByAssignedTo_Id(@Param("userId") UUID userId);
}
