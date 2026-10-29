import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/AppLayout";
import {
  Plus,
  RefreshCw,
  CheckSquare,
  Square,
  Trash2,
  Pencil,
  Calendar,
  User,
  UsersRound,
} from "lucide-react";
import { tasksApi, teamsApi, leadsApi, type TaskDto, type TeamDto, type LeadDto } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const STATUS_OPTIONS: TaskDto["status"][] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const PRIORITY_OPTIONS: TaskDto["priority"][] = ["LOW", "MEDIUM", "HIGH"];

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDto | null>(null);
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [leads, setLeads] = useState<LeadDto[]>([]);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await tasksApi.getVisible(page, 20);
      setTasks(res.content ?? []);
      setTotalPages(res.totalPages ?? 0);
    } catch (e) {
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (formOpen) {
      teamsApi.getAll(0, 50).then((p) => setTeams(p.content ?? []));
      leadsApi.getAll(0, 100).then((p) => setLeads(p.content ?? []));
    }
  }, [formOpen]);

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (t: TaskDto) => {
    setEditing(t);
    setFormOpen(true);
  };

  const handleToggleStatus = async (t: TaskDto) => {
    if (!t.id) return;
    const next = t.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await tasksApi.updateStatus(t.id, next);
      toast.success("Task updated");
      fetchTasks();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tasksApi.delete(id);
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[900px] mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchTasks} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-1" />
              New task
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks yet. Create one to get started.</p>
            <Button className="mt-4" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create task
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)]">
            <ul className="space-y-2 pr-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    {task.status === "COMPLETED" ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-foreground ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.assignedToName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignedToName}
                        </span>
                      )}
                      {task.teamName && (
                        <Badge variant="secondary" className="text-[10px]">
                          <UsersRound className="w-3 h-3 mr-0.5" />
                          {task.teamName}
                        </Badge>
                      )}
                      {task.status && (
                        <Badge variant="outline" className="text-[10px]">
                          {task.status.replace("_", " ")}
                        </Badge>
                      )}
                      {task.priority && task.priority !== "MEDIUM" && (
                        <Badge variant="outline" className="text-[10px]">
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => task.id && handleDelete(task.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </ScrollArea>
        )}

        <TaskFormDialog
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSaved={() => {
            setFormOpen(false);
            setEditing(null);
            fetchTasks();
          }}
          editing={editing}
          teams={teams}
          leads={leads}
          currentUserId={user?.id}
        />
      </div>
    </AppLayout>
  );
}

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing: TaskDto | null;
  teams: TeamDto[];
  leads: LeadDto[];
  currentUserId?: string;
}

function TaskFormDialog({
  open,
  onClose,
  onSaved,
  editing,
  teams,
  leads,
  currentUserId,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskDto["status"]>("PENDING");
  const [priority, setPriority] = useState<TaskDto["priority"]>("MEDIUM");
  const [teamId, setTeamId] = useState<string>("");
  const [leadId, setLeadId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title ?? "");
        setDescription(editing.description ?? "");
        setDueDate(editing.dueDate ? editing.dueDate.slice(0, 10) : "");
        setStatus(editing.status ?? "PENDING");
        setPriority(editing.priority ?? "MEDIUM");
        setTeamId(editing.teamId ?? "");
        setLeadId(editing.leadId ?? "");
      } else {
        setTitle("");
        setDescription("");
        setDueDate("");
        setStatus("PENDING");
        setPriority("MEDIUM");
        setTeamId("");
        setLeadId("");
      }
    }
  }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload: TaskDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        status,
        priority,
        assignedToId: editing?.assignedToId ?? currentUserId,
        teamId: teamId || undefined,
        leadId: leadId || undefined,
      };
      if (editing?.id) {
        await tasksApi.update(editing.id, payload);
        toast.success("Task updated");
      } else {
        if (!currentUserId) {
          toast.error("You must be logged in to create a task");
          return;
        }
        await tasksApi.create({ ...payload, assignedToId: currentUserId });
        toast.success("Task created");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="mt-1 min-h-[80px]"
            />
          </div>
          <div>
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskDto["status"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s?.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskDto["priority"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Team (optional)</Label>
            <Select value={teamId || "none"} onValueChange={(v) => setTeamId(v === "none" || !v ? "" : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="No team">
                  {teamId && teamId !== "none" 
                    ? (teams.find(t => t.id === teamId)?.name || editing?.teamName || teamId)
                    : "No team"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id!}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Link to lead (optional)</Label>
            <Select value={leadId || "none"} onValueChange={(v) => setLeadId(v === "none" || !v ? "" : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="No lead">
                  {leadId && leadId !== "none" 
                    ? (leads.find(l => l.id === leadId)?.title || editing?.leadTitle || leadId)
                    : "No lead"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No lead</SelectItem>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id!}>
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
