package com.hokma.auth.demo.crm.repository;

import com.hokma.auth.demo.crm.entity.Task;
import com.hokma.auth.demo.crm.entity.Task.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByAssignedTo_IdOrderByDueDateAsc(@Param("userId") UUID userId, Pageable pageable);

    Page<Task> findByTeam_IdOrderByDueDateAsc(@Param("teamId") UUID teamId, Pageable pageable);

    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.team team LEFT JOIN team.members mem " +
           "WHERE t.assignedTo.id = :userId OR team.owner.id = :userId OR mem.id = :userId")
    Page<Task> findVisibleToUser(@Param("userId") UUID userId, Pageable pageable);

    Page<Task> findByAssignedTo_IdAndStatusOrderByDueDateAsc(
            @Param("userId") UUID userId, @Param("status") TaskStatus status, Pageable pageable);
}
