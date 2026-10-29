import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ChevronRight,
  RefreshCw,
  CheckSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/AppLayout";
import {
  analyticsApi,
  leadsApi,
  tasksApi,
  type AnalyticsDto,
  type LeadDto,
  type TaskDto,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "oklch(0.627 0.265 149.213)",
  "oklch(0.577 0.245 27.325)",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDueDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsDto | null>(null);
  const [recentLeads, setRecentLeads] = useState<LeadDto[]>([]);
  const [dashboardTasks, setDashboardTasks] = useState<TaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsData, leadsPage, tasks] = await Promise.all([
        analyticsApi.getDashboard(),
        leadsApi.getAll(0, 5, "createdAt,desc"),
        tasksApi.getDashboard(10),
      ]);
      setAnalytics(analyticsData);
      setRecentLeads(leadsPage.content ?? []);
      setDashboardTasks(Array.isArray(tasks) ? tasks : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const metrics = analytics
    ? [
        {
          label: "Total Leads",
          value: analytics.totalLeads.toString(),
          sub: `${analytics.newLeads} new`,
          icon: Target,
        },
        {
          label: "Total Opportunity",
          value: analytics.openLeads.toString(),
          sub: "open in pipeline",
          icon: TrendingUp,
        },
        {
          label: "Total Sales",
          value: formatCurrency(analytics.totalWonValue),
          sub: formatCurrency(analytics.totalPipelineValue) + " pipeline",
          icon: DollarSign,
        },
        {
          label: "Conversion Rate",
          value: `${analytics.conversionRate.toFixed(1)}%`,
          sub: `${analytics.wonLeads} won`,
          icon: Users,
        },
      ]
    : null;

  const leadByStatusData =
    analytics && analytics.leadsByStatus
      ? Object.entries(analytics.leadsByStatus).map(([name, value], i) => ({
          name: name.replace("_", " ").toLowerCase(),
          value,
          fill: CHART_COLORS[i % CHART_COLORS.length],
        }))
      : [];

  const salesSummaryData = analytics
    ? [
        { name: "Pipeline", value: Number(analytics.totalPipelineValue), fill: "hsl(var(--chart-2))" },
        { name: "Won", value: Number(analytics.totalWonValue), fill: "oklch(0.627 0.265 149.213)" },
      ]
    : [];

  const leadStatusChartConfig: ChartConfig = {
    value: { label: "Leads" },
    ...Object.fromEntries(
      (Object.keys(analytics?.leadsByStatus ?? {})).map((k, i) => [
        k.toLowerCase(),
        { label: k.replace("_", " "), color: CHART_COLORS[i % CHART_COLORS.length] },
      ])
    ),
  };

  return (
    <AppLayout>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[26px] lg:text-[28px] font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Latest updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={fetchAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {error} — <button onClick={fetchAll} className="underline">Retry</button>
          </div>
        )}

        {/* Summary cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-5 border border-border animate-pulse h-28" />
              ))
            : metrics?.map((m) => (
                <motion.div
                  key={m.label}
                  variants={item}
                  className="bg-card rounded-2xl p-5 shadow-apple-sm border border-border hover:shadow-apple-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <m.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-[12px] font-medium text-muted-foreground">{m.sub}</span>
                  </div>
                  <p className="text-[22px] lg:text-[24px] font-semibold tracking-tight text-foreground">
                    {m.value}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{m.label}</p>
                  <button
                    onClick={() => navigate("/analytics")}
                    className="mt-2 text-[12px] text-primary hover:underline"
                  >
                    See more details &gt;
                  </button>
                </motion.div>
              ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lead by Status (donut) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl p-4 border border-border"
          >
            <h2 className="text-[15px] font-semibold text-foreground mb-2">Lead by Status</h2>
            {isLoading ? (
              <div className="h-[220px] flex items-center justify-center bg-muted/30 rounded-xl animate-pulse" />
            ) : leadByStatusData.length > 0 ? (
              <ChartContainer config={leadStatusChartConfig} className="mx-auto aspect-square max-h-[220px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={leadByStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    strokeWidth={2}
                  >
                    {leadByStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-1" />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-[13px] text-muted-foreground py-8 text-center">No lead data</p>
            )}
            {analytics && (
              <p className="text-center text-[12px] text-muted-foreground mt-1">
                Total {analytics.totalLeads} leads
              </p>
            )}
          </motion.div>

          {/* Sales Summary (bar) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="bg-card rounded-2xl p-4 border border-border"
          >
            <h2 className="text-[15px] font-semibold text-foreground mb-2">Sales Summary</h2>
            {isLoading ? (
              <div className="h-[220px] flex items-center justify-center bg-muted/30 rounded-xl animate-pulse" />
            ) : salesSummaryData.length > 0 ? (
              <ChartContainer config={{ value: { label: "Value" } }} className="h-[220px] w-full">
                <BarChart data={salesSummaryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000) + "k" : v}`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => `$${Number(v).toLocaleString()}`} />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-[13px] text-muted-foreground py-8 text-center">No sales data</p>
            )}
          </motion.div>

          {/* Pipeline Summary list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-[15px] font-semibold text-foreground">Pipeline Summary</h2>
            </div>
            <div className="max-h-[240px] overflow-auto">
              {isLoading ? (
                <div className="p-4 space-y-3 animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : analytics && Object.keys(analytics.leadsByStatus).length > 0 ? (
                <>
                  {Object.entries(analytics.leadsByStatus).map(([status, count], i, arr) => (
                    <div
                      key={status}
                      className={`flex items-center justify-between px-4 py-3 ${i !== arr.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <p className="text-[13px] font-medium text-foreground capitalize">
                        {status.toLowerCase().replace("_", " ")}
                      </p>
                      <span className="text-[18px] font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-8 text-center text-[13px] text-muted-foreground">No data</div>
              )}
            </div>
            <button
              onClick={() => navigate("/deals")}
              className="w-full flex items-center justify-center gap-1 py-3 text-[13px] font-medium text-primary hover:bg-muted/50 transition-colors border-t border-border"
            >
              View all leads <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Recent Leads */}
          <section className="bg-card rounded-2xl shadow-apple-sm border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-[14px] font-semibold text-foreground">Recent Lead</h2>
              <p className="text-[11px] text-muted-foreground">Latest deals in your pipeline</p>
            </div>
            <ScrollArea className="h-[280px]">
              {isLoading ? (
                <div className="p-4 space-y-3 animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : recentLeads.length ? (
                <ul className="divide-y divide-border">
                  {recentLeads.map((lead) => (
                    <li
                      key={lead.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => navigate("/deals")}
                    >
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-[12px] font-semibold text-foreground">
                        {(lead.contactName || lead.title || "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {lead.contactName ?? lead.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {lead.contactName ? lead.title : lead.contactName ?? "—"}
                        </p>
                      </div>
                      {lead.status && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {lead.status}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                  No recent leads. Create a deal to get started.
                </div>
              )}
            </ScrollArea>
          </section>

          {/* My Task */}
          <section className="bg-card rounded-2xl shadow-apple-sm border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">My Task</h2>
                <p className="text-[11px] text-muted-foreground">Tasks assigned to you and team tasks</p>
              </div>
              <button
                onClick={() => navigate("/tasks")}
                className="text-[12px] text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="px-4 py-3 space-y-2 max-h-[280px] overflow-auto">
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : dashboardTasks.length ? (
                dashboardTasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    onClick={() => navigate("/tasks")}
                  >
                    <CheckSquare
                      className={`w-4 h-4 mt-0.5 shrink-0 ${task.status === "COMPLETED" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground truncate">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {task.dueDate && (
                          <span className="text-[11px] text-muted-foreground">
                            {formatDueDate(task.dueDate)}
                          </span>
                        )}
                        {task.teamName && (
                          <Badge variant="secondary" className="text-[10px]">
                            {task.teamName}
                          </Badge>
                        )}
                        {task.status && task.status !== "COMPLETED" && (
                          <Badge variant="outline" className="text-[10px]">
                            {task.status.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      {task.assignedToName && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Assigned to {task.assignedToName}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-[13px] text-muted-foreground text-center">
                  No tasks yet. Create one from the Tasks page.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
