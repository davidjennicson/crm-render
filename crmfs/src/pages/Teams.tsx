import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/AppLayout";
import { Plus, RefreshCw, UsersRound, ExternalLink, User } from "lucide-react";
import { teamsApi, type TeamDto } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailTeam, setDetailTeam] = useState<TeamDto | null>(null);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await teamsApi.getAll(page, 20);
      setTeams(res.content ?? []);
      setTotalPages(res.totalPages ?? 0);
    } catch {
      toast.error("Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreate = () => setFormOpen(true);
  const handleViewPipeline = (teamId: string) => {
    navigate("/deals", { state: { teamId } });
  };

  return (
    <AppLayout>
      <div className="max-w-[900px] mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Teams</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchTeams} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-1" />
              New team
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Create teams to share pipeline visibility. All members can see deals assigned to anyone in the team.
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            <UsersRound className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No teams yet. Create one to collaborate.</p>
            <Button className="mt-4" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create team
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <ul className="space-y-3 pr-2">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <UsersRound className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{team.name}</p>
                    {team.description && (
                      <p className="text-sm text-muted-foreground truncate">{team.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {team.ownerName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Owner: {team.ownerName}
                        </span>
                      )}
                      {team.memberNames && team.memberNames.length > 0 && (
                        <span>{team.memberNames.length} member(s)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailTeam(team)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => team.id && handleViewPipeline(team.id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View pipeline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4 pb-4">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="flex items-center text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </ScrollArea>
        )}

        <CreateTeamDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            fetchTeams();
          }}
        />
        {detailTeam && (
          <TeamDetailDialog
            team={detailTeam}
            onClose={() => setDetailTeam(null)}
            onViewPipeline={() => {
              if (detailTeam.id) handleViewPipeline(detailTeam.id);
              setDetailTeam(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

function CreateTeamDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }
    setSaving(true);
    try {
      await teamsApi.create({ name: name.trim(), description: description.trim() || undefined });
      toast.success("Team created");
      onSaved();
    } catch {
      toast.error("Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team-name">Name *</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales West"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="team-desc">Description</Label>
            <Textarea
              id="team-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="mt-1 min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamDetailDialog({
  team,
  onClose,
  onViewPipeline,
}: {
  team: TeamDto;
  onClose: () => void;
  onViewPipeline: () => void;
}) {
  const memberNames = team.memberNames ? Array.from(team.memberNames) : [];

  return (
    <Dialog open={!!team.id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{team.name}</DialogTitle>
        </DialogHeader>
        {team.description && (
          <p className="text-sm text-muted-foreground">{team.description}</p>
        )}
        <div>
          <p className="text-sm font-medium text-foreground">Owner</p>
          <p className="text-sm text-muted-foreground">{team.ownerName ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Members</p>
          {memberNames.length > 0 ? (
            <ul className="text-sm text-muted-foreground space-y-0.5">
              {memberNames.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No other members yet.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onViewPipeline}>
            <ExternalLink className="w-4 h-4 mr-1" />
            View team pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
