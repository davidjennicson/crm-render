
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import type { Deal } from "../../types/crm";
interface DealsGraphProps {
  deals: Deal[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

function parseValue(v: string): number {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  if (v.includes("K")) return n * 1000;
  if (v.includes("M")) return n * 1000000;
  return n || 0;
}

export function DealsGraph({ deals }: DealsGraphProps) {
  const stageOrder = ["Discovery", "Proposal", "Negotiation", "Closed Won"];

  const stageData = stageOrder.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    return {
      name: stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + parseValue(d.value), 0),
    };
  });

  const pieData = stageOrder.map((stage, i) => ({
    name: stage,
    value: deals.filter(d => d.stage === stage).length,
    color: COLORS[i],
  }));

  const priorityData = ["low", "medium", "high"].map(p => ({
    name: p,
    count: deals.filter(d => (d.priority ?? "medium") === p).length,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-4"
    >
      {/* Pipeline Value by Stage */}
      <div className="bg-card rounded-2xl p-5 shadow-apple-sm border border-border">
        <h3 className="text-[14px] font-semibold text-foreground mb-4">Pipeline Value by Stage</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, "Value"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {stageData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Deals by Stage */}
      <div className="bg-card rounded-2xl p-5 shadow-apple-sm border border-border">
        <h3 className="text-[14px] font-semibold text-foreground mb-4">Deals by Stage</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          {pieData.map((entry, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
              <span className="text-[11px] text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Count by Stage */}
      <div className="bg-card rounded-2xl p-5 shadow-apple-sm border border-border">
        <h3 className="text-[14px] font-semibold text-foreground mb-4">Deal Count by Stage</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--primary)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Priority Distribution */}
      <div className="bg-card rounded-2xl p-5 shadow-apple-sm border border-border">
        <h3 className="text-[14px] font-semibold text-foreground mb-4">Priority Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={priorityData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={60} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" fill="var(--chart-3)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </motion.div>
  );
}
