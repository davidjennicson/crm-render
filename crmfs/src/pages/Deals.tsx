import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Kanban, Table2, List, BarChart3, RefreshCw, UsersRound } from "lucide-react";
import { AppLayout } from "@/AppLayout";
import { leadsApi, teamsApi, type LeadDto, type LeadStatus, type TeamDto } from "@/lib/api";
import { DealsKanban } from "@/components/deals/DealsKanban";
import { DealsTable } from "@/components/deals/DealsTable";
import { DealsList } from "@/components/deals/DealsList";
import { DealsGraph } from "@/components/deals/DealsGraph";
import { LeadFormDialog } from "@/components/deals/LeadFormDialog";
import { leadToUIDeal, STAGE_TO_STATUS } from "@/components/deals/DealUtils";
import type { Deal } from "@/types/crm";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DealWithRaw = Deal & { _raw?: LeadDto };
type ViewMode = "kanban" | "table" | "list" | "graph";

const viewOptions: { key: ViewMode; label: string; icon: typeof Kanban }[] = [
  { key: "kanban", label: "Kanban", icon: Kanban },
  { key: "table", label: "Table", icon: Table2 },
  { key: "list", label: "List", icon: List },
  { key: "graph", label: "Graph", icon: BarChart3 },
];

const Deals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [deals, setDeals] = useState<DealWithRaw[]>([]);
  const [view, setView] = useState<ViewMode>("kanban");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(() => (location.state as { teamId?: string })?.teamId ?? null);
  const [teams, setTeams] = useState<TeamDto[]>([]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const page = teamId
        ? await leadsApi.getForTeam(teamId, 0, 100)
        : await leadsApi.getAll(0, 100);
      setLeads(page.content ?? []);
      setDeals((page.content ?? []).map(leadToUIDeal));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    teamsApi.getAll(0, 50).then((p) => setTeams(p.content ?? []));
  }, []);

  useEffect(() => {
    const tid = (location.state as { teamId?: string })?.teamId;
    if (tid) setTeamId(tid);
  }, [location.state]);

  const totalValue = deals.reduce((sum, d) => {
    const n = parseFloat(d.value.replace(/[^0-9.]/g, ""));
    return sum + n;
  }, 0);

  const formatTotal = (v: number) =>
    v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${Math.round(v)}`;

  const handleLeadSaved = (saved: LeadDto) => {
    setLeads((prev) => {
      const idx = prev.findIndex((l) => l.id === saved.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = saved; return u; }
      return [saved, ...prev];
    });
    setDeals((prev) => {
      const idx = prev.findIndex((d) => d.id === saved.id);
      const mapped = leadToUIDeal(saved);
      if (idx >= 0) { const u = [...prev]; u[idx] = mapped; return u; }
      return [mapped, ...prev];
    });
  };

  const handleEditDeal = (deal: DealWithRaw) => {
    const raw = deal._raw ?? leads.find((l) => l.id === deal.id) ?? null;
    setEditingLead(raw);
    setFormOpen(true);
  };

  const handleUpdateDeals = async (updated: DealWithRaw[]) => {
    setDeals(updated);
    for (const d of updated) {
      const original = leads.find((l) => l.id === d.id);
      if (!original) continue;
      const newStatus: LeadStatus = STAGE_TO_STATUS[d.stage] ?? "NEW";
      if (newStatus !== original.status) {
        try {
          const patched = await leadsApi.updateStatus(d.id, newStatus);
          setLeads((prev) => prev.map((l) => (l.id === patched.id ? patched : l)));
        } catch (err: unknown) {
          toast.error(`Failed to update ${d.title}: ${err instanceof Error ? err.message : "error"}`);
        }
      }
    }
  };

  return (
    <AppLayout>
      <div className="px-8 py-8 h-full">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Deals</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <p className="text-[15px] text-muted-foreground">
                Pipeline value:{" "}
                <span className="font-semibold text-foreground">
                  {isLoading ? "..." : formatTotal(totalValue)}
                </span>
              </p>
              <Select
                value={teamId ?? "mine"}
                onValueChange={(v) => {
                  setTeamId(v === "mine" ? null : v);
                  if (v !== "mine") navigate(".", { state: { teamId: v }, replace: true });
                  else navigate(".", { state: {}, replace: true });
                }}
              >
                <SelectTrigger className="w-[200px] h-9 text-[13px]">
                  <UsersRound className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Pipeline">
                    {teamId === null ? "My pipeline" : (teams.find(t => t.id === teamId)?.name || "Loading...")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mine">My pipeline</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id!}>
                      Team: {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeads}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
              {viewOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setView(opt.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    view === opt.key
                      ? "bg-card text-foreground shadow-apple-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setEditingLead(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Deal
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {error} — <button onClick={fetchLeads} className="underline">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading deals...
          </div>
        ) : (
          <>
            {view === "kanban" && <DealsKanban deals={deals} onEditDeal={handleEditDeal} onUpdateDeals={handleUpdateDeals} />}
            {view === "table" && <DealsTable deals={deals} onEditDeal={handleEditDeal} />}
            {view === "list" && <DealsList deals={deals} onEditDeal={handleEditDeal} />}
            {view === "graph" && <DealsGraph deals={deals} />}
          </>
        )}

        <LeadFormDialog
          open={formOpen}
          editing={editingLead}
          onClose={() => setFormOpen(false)}
          onSaved={handleLeadSaved}
        />
      </div>
    </AppLayout>
  );
};

export default Deals;
