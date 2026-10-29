package com.hokma.auth.demo.crm.service;

import com.hokma.auth.demo.crm.dto.TaskDto;
import com.hokma.auth.demo.crm.entity.Task.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface TaskService {

    TaskDto createTask(TaskDto dto);

    TaskDto getTaskById(UUID id);

    TaskDto updateTask(UUID id, TaskDto dto);

    TaskDto updateTaskStatus(UUID id, TaskStatus status);

    void deleteTask(UUID id);

    Page<TaskDto> getMyTasks(Pageable pageable);

    /** Tasks visible to current user (assigned to me or team tasks where I'm a member). */
    Page<TaskDto> getVisibleTasks(Pageable pageable);

    /** For dashboard: recent tasks visible to user, limited count. */
    List<TaskDto> getMyTasksForDashboard(int limit);

    Page<TaskDto> getTasksByTeam(UUID teamId, Pageable pageable);
}
