package com.hokma.auth.demo.crm.repository;

import com.hokma.auth.demo.crm.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {

    Page<Team> findByOwner_Id(@Param("ownerId") UUID ownerId, Pageable pageable);

    @Query("SELECT t FROM Team t JOIN t.members m WHERE m.id = :userId OR t.owner.id = :userId")
    Page<Team> findByMemberOrOwner(@Param("userId") UUID userId, Pageable pageable);

    boolean existsByIdAndOwner_Id(UUID teamId, UUID ownerId);

    boolean existsByIdAndMembers_Id(UUID teamId, UUID userId);
}
