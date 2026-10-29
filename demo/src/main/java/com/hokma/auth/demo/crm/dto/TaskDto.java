package com.hokma.auth.demo.crm.dto;

import com.hokma.auth.demo.crm.entity.Task.TaskPriority;
import com.hokma.auth.demo.crm.entity.Task.TaskStatus;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {
    private UUID id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private TaskStatus status;
    private TaskPriority priority;
    private UUID assignedToId;
    private String assignedToName;
    private UUID leadId;
    private String leadTitle;
    private UUID teamId;
    private String teamName;
    private UUID createdById;
    private String createdByName;
    private Instant createdAt;
    private Instant updatedAt;
}
