package com.hokma.auth.demo.crm.controller;

import com.hokma.auth.demo.crm.dto.TaskDto;
import com.hokma.auth.demo.crm.entity.Task.TaskStatus;
import com.hokma.auth.demo.crm.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "CRM Tasks")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Create a task")
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(dto));
    }

    @Operation(summary = "Get task by ID")
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTask(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @Operation(summary = "Update a task")
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable("id") UUID id, @RequestBody TaskDto dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @Operation(summary = "Update task status")
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateStatus(@PathVariable("id") UUID id, @RequestParam("status") TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }

    @Operation(summary = "Delete a task")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable("id") UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get my tasks (assigned to me)")
    @GetMapping("/my")
    public ResponseEntity<org.springframework.data.domain.Page<TaskDto>> getMyTasks(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(taskService.getMyTasks(org.springframework.data.domain.PageRequest.of(page, size)));
    }

    @Operation(summary = "Get all tasks visible to me (my tasks + team tasks)")
    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<TaskDto>> getVisibleTasks(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(taskService.getVisibleTasks(org.springframework.data.domain.PageRequest.of(page, size)));
    }

    @Operation(summary = "Get tasks for dashboard widget")
    @GetMapping("/dashboard")
    public ResponseEntity<List<TaskDto>> getDashboardTasks(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(taskService.getMyTasksForDashboard(limit));
    }

    @Operation(summary = "Get tasks by team")
    @GetMapping("/team/{teamId}")
    public ResponseEntity<org.springframework.data.domain.Page<TaskDto>> getTasksByTeam(
            @PathVariable("teamId") UUID teamId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(taskService.getTasksByTeam(teamId, org.springframework.data.domain.PageRequest.of(page, size)));
    }
}
