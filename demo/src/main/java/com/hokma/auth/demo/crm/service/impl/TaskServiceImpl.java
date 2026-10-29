package com.hokma.auth.demo.crm.service.impl;

import com.hokma.auth.demo.crm.dto.TaskDto;
import com.hokma.auth.demo.crm.entity.Task;
import com.hokma.auth.demo.crm.entity.Task.TaskStatus;
import com.hokma.auth.demo.crm.entity.Team;
import com.hokma.auth.demo.crm.mapper.TaskMapper;
import com.hokma.auth.demo.auth.entity.User;
import com.hokma.auth.demo.auth.repository.UserRepository;
import com.hokma.auth.demo.crm.repository.LeadRepository;
import com.hokma.auth.demo.crm.repository.TaskRepository;
import com.hokma.auth.demo.crm.repository.TeamRepository;
import com.hokma.auth.demo.crm.service.TaskService;
import com.hokma.auth.demo.crm.validator.TaskValidator;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import com.hokma.auth.demo.shared.helper.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final TaskValidator taskValidator;
    private final TeamRepository teamRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TaskDto createTask(TaskDto dto) {
        taskValidator.validateForCreate(dto);
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        Task task = taskMapper.toEntity(dto);
        task.setCreatedBy(SecurityHelper.getCurrentUser());
        task.setAssignedTo(resolveUser(dto.getAssignedToId()));
        if (dto.getLeadId() != null) {
            task.setLead(leadRepository.findById(dto.getLeadId()).orElse(null));
        }
        if (dto.getTeamId() != null) {
            taskValidator.validateTeamAccess(dto.getTeamId(), userId);
            task.setTeam(teamRepository.findById(dto.getTeamId()).orElseThrow(() -> new ResourceNotFoundException("Team not found")));
        }
        return taskMapper.toDto(taskRepository.save(task));
    }

    @Override
    public TaskDto getTaskById(UUID id) {
        Task task = findOrThrow(id);
        return taskMapper.toDto(task);
    }

    @Override
    @Transactional
    public TaskDto updateTask(UUID id, TaskDto dto) {
        taskValidator.validateForUpdate(dto);
        Task existing = findOrThrow(id);
        if (dto.getTitle() != null) existing.setTitle(dto.getTitle());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getDueDate() != null) existing.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
        if (dto.getPriority() != null) existing.setPriority(dto.getPriority());
        if (dto.getAssignedToId() != null) existing.setAssignedTo(resolveUser(dto.getAssignedToId()));
        if (dto.getLeadId() != null) {
            existing.setLead(leadRepository.findById(dto.getLeadId()).orElse(null));
        }
        if (dto.getTeamId() != null) {
            taskValidator.validateTeamAccess(dto.getTeamId(), SecurityHelper.getAuthenticatedUserId());
            existing.setTeam(teamRepository.findById(dto.getTeamId()).orElse(null));
        }
        return taskMapper.toDto(taskRepository.save(existing));
    }

    @Override
    @Transactional
    public TaskDto updateTaskStatus(UUID id, TaskStatus status) {
        Task task = findOrThrow(id);
        task.setStatus(status);
        return taskMapper.toDto(taskRepository.save(task));
    }

    @Override
    @Transactional
    public void deleteTask(UUID id) {
        taskRepository.delete(findOrThrow(id));
    }

    @Override
    public org.springframework.data.domain.Page<TaskDto> getMyTasks(Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        Pageable withSort = pageable.getSort().isSorted()
                ? pageable
                : PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(new Sort.Order(Sort.Direction.ASC, "dueDate").with(Sort.NullHandling.NULLS_LAST)));
        return taskRepository.findByAssignedTo_IdOrderByDueDateAsc(userId, withSort).map(taskMapper::toDto);
    }

    @Override
    public org.springframework.data.domain.Page<TaskDto> getVisibleTasks(Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        Pageable withSort = pageable.getSort().isSorted()
                ? pageable
                : PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(new Sort.Order(Sort.Direction.ASC, "dueDate").with(Sort.NullHandling.NULLS_LAST)));
        return taskRepository.findVisibleToUser(userId, withSort).map(taskMapper::toDto);
    }

    @Override
    public List<TaskDto> getMyTasksForDashboard(int limit) {
        Pageable page = PageRequest.of(0, limit, Sort.by(new Sort.Order(Sort.Direction.ASC, "dueDate").with(Sort.NullHandling.NULLS_LAST)));
        return getVisibleTasks(page).getContent();
    }

    @Override
    public org.springframework.data.domain.Page<TaskDto> getTasksByTeam(UUID teamId, Pageable pageable) {
        UUID userId = SecurityHelper.getAuthenticatedUserId();
        taskValidator.validateTeamAccess(teamId, userId);
        Pageable withSort = pageable.getSort().isSorted()
                ? pageable
                : PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(new Sort.Order(Sort.Direction.ASC, "dueDate").with(Sort.NullHandling.NULLS_LAST)));
        return taskRepository.findByTeam_IdOrderByDueDateAsc(teamId, withSort).map(taskMapper::toDto);
    }

    private Task findOrThrow(UUID id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        taskValidator.validateOwnership(task, SecurityHelper.getAuthenticatedUserId());
        return task;
    }

    private User resolveUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
