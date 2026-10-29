import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LabelList
} from "recharts";
import {
  TrendingUp,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { AppLayout } from "@/AppLayout";
import { analyticsApi, type AnalyticsDto } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";

const DashboardAnalytics = () => {
  const [data, setData] = useState<AnalyticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await analyticsApi.getDashboard();
      setData(result);
    } catch (err: any) {
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const leadStatusData = data ? Object.entries(data.leadsByStatus).map(([name, value]) => ({
    status: name.toLowerCase(),
    count: value,
    fill: `var(--color-${name.toLowerCase()})`
  })) : [];

  const leadSourceData = data ? Object.entries(data.leadsBySource).map(([name, value]) => ({
    source: name.toLowerCase().replace("_", " "),
    count: value,
    fill: "var(--color-leads)"
  })) : [];

  const contactStatusData = data ? Object.entries(data.contactsByStatus).map(([name, value]) => ({
    segment: name.toLowerCase(),
    count: value,
    fill: `var(--color-${name.toLowerCase()})`
  })) : [];

  const pipelineComparison = data ? [
    { type: "potential", value: data.totalPipelineValue, fill: "var(--color-potential)" },
    { type: "realized", value: data.totalWonValue, fill: "var(--color-realized)" }
  ] : [];

  // Chart Configurations
  const leadStatusConfig = {
    count: { label: "Leads" },
    new: { label: "New", color: "hsl(var(--chart-1))" },
    contacted: { label: "Contacted", color: "hsl(var(--chart-2))" },
    qualified: { label: "Qualified", color: "hsl(var(--chart-3))" },
    proposal: { label: "Proposal", color: "hsl(var(--chart-4))" },
    negotiation: { label: "Negotiation", color: "hsl(var(--chart-5))" },
    won: { label: "Won", color: "oklch(0.627 0.265 149.213)" },
    lost: { label: "Lost", color: "oklch(0.577 0.245 27.325)" },
  } satisfies ChartConfig;

  const leadSourceConfig = {
    count: { label: "Leads" },
    leads: { label: "Leads", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const contactSegmentsConfig = {
    count: { label: "Contacts" },
    active: { label: "Active", color: "hsl(var(--chart-1))" },
    inactive: { label: "Inactive", color: "hsl(var(--chart-2))" },
    blocked: { label: "Blocked", color: "hsl(var(--chart-5))" },
  } satisfies ChartConfig;

  const pipelineConfig = {
    value: { label: "Value" },
    potential: { label: "Pipeline Value", color: "hsl(var(--chart-2))" },
    realized: { label: "Realized Revenue", color: "oklch(0.627 0.265 149.213)" },
  } satisfies ChartConfig;

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Revenue Intelligence</h1>
            <p className="text-muted-foreground mt-1">Real-time insights across your sales pipeline and customer lifecycle.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-[13px] font-medium hover:bg-muted transition-colors shadow-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-[13px] font-medium hover:bg-muted transition-colors shadow-sm">
              <Filter className="w-4 h-4 text-muted-foreground" />
              Filter
            </button>
            <button 
              onClick={fetchData}
              disabled={isLoading}
              className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard 
            title="Conversion Rate" 
            value={`${data?.conversionRate.toFixed(1) || 0}%`} 
            trend="+2.5%" 
            icon={TrendingUp}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Open Leads" 
            value={data?.openLeads || 0} 
            trend="-3" 
            icon={Target}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Avg. Deal Value" 
            value={`$${data && data.totalLeads > 0 ? (data.totalPipelineValue / data.totalLeads).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}`} 
            trend="+12%" 
            icon={BarChart3}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Active Contacts" 
            value={data?.activeContacts || 0} 
            trend="+8" 
            icon={PieChartIcon}
            isLoading={isLoading}
          />
        </div>

        {/* Charts Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Lead Status Distribution */}
  <Card className="rounded-xl border-border shadow-apple-sm overflow-hidden flex flex-col h-[360px]">
    <CardHeader className="items-center pb-2">
      <CardTitle>Lead Lifecycle Stage</CardTitle>
      <CardDescription>Current status of all active leads</CardDescription>
    </CardHeader>

    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={leadStatusConfig}
        className="mx-auto aspect-square max-h-[240px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />

          <Pie
            data={leadStatusData}
            dataKey="count"
            nameKey="status"
            innerRadius={60}
            strokeWidth={5}
          >
            {leadStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>

          <ChartLegend
            content={<ChartLegendContent />}
            className="-translate-y-2 flex-wrap gap-2 px-2"
          />
        </PieChart>
      </ChartContainer>
    </CardContent>

    <CardFooter className="flex-col gap-2 text-sm pt-3 border-t bg-muted/30">
      <div className="flex items-center gap-2 font-medium leading-none">
        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
      </div>
      <div className="leading-none text-muted-foreground">
        Showing distribution across all workflow stages
      </div>
    </CardFooter>
  </Card>

  {/* Lead Sources */}
  <Card className="rounded-xl border-border shadow-apple-sm overflow-hidden flex flex-col h-[360px]">
    <CardHeader>
      <CardTitle>Acquisition Channels</CardTitle>
      <CardDescription>
        Top sources driving new lead volume
      </CardDescription>
    </CardHeader>

    <CardContent className="flex-1">
      <ChartContainer config={leadSourceConfig} className="h-full w-full">
        <BarChart
          data={leadSourceData}
          layout="vertical"
          margin={{ left: 20, right: 40 }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            opacity={0.3}
          />

          <YAxis
            dataKey="source"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            fontSize={12}
            className="capitalize"
          />

          <XAxis type="number" hide />

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />

          <Bar
            dataKey="count"
            fill="var(--color-leads)"
            radius={5}
            barSize={28}
          >
            <LabelList
              dataKey="count"
              position="right"
              offset={8}
              className="fill-foreground font-semibold"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </CardContent>

    <CardFooter className="text-xs text-muted-foreground pt-3 border-t bg-muted/30">
      Data synchronized via integrated lead tracking system
    </CardFooter>
  </Card>

  {/* Contact Segments */}
  <Card className="rounded-xl border-border shadow-apple-sm overflow-hidden flex flex-col h-[360px]">
    <CardHeader className="items-center pb-2">
      <CardTitle>Contact Growth</CardTitle>
      <CardDescription>Total contact base segmentation</CardDescription>
    </CardHeader>

    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={contactSegmentsConfig}
        className="mx-auto aspect-square max-h-[240px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />

          <Pie
            data={contactStatusData}
            dataKey="count"
            nameKey="segment"
            strokeWidth={5}
          >
            {contactStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>

          <ChartLegend
            content={<ChartLegendContent />}
            className="-translate-y-2 flex-wrap gap-2 px-2"
          />
        </PieChart>
      </ChartContainer>
    </CardContent>

    <CardFooter className="flex-col gap-2 text-sm pt-3 border-t bg-muted/30">
      <div className="flex items-center gap-2 font-medium leading-none">
        Customer base grew by 12% QoQ{" "}
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </CardFooter>
  </Card>

  {/* Value Comparison */}
  <Card className="rounded-xl border-border shadow-apple-sm overflow-hidden flex flex-col h-[360px]">
    <CardHeader>
      <CardTitle>Pipeline Economics</CardTitle>
      <CardDescription>
        Gross Pipeline vs. Net Realized Revenue
      </CardDescription>
    </CardHeader>

    <CardContent className="flex-1">
      <ChartContainer config={pipelineConfig} className="h-full w-full">
        <BarChart
          data={pipelineComparison}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            opacity={0.3}
          />

          <XAxis
            dataKey="type"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
            tickFormatter={(value: string) =>
              pipelineConfig[value as keyof typeof pipelineConfig]?.label ||
              value
            }
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />

          <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={70}>
            {pipelineComparison.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}

            <LabelList
              dataKey="value"
              position="top"
              offset={12}
              className="fill-foreground font-bold"
              fontSize={14}
              formatter={(val: number) => `$${val.toLocaleString()}`}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </CardContent>

    <CardFooter className="text-xs text-muted-foreground pt-3 border-t bg-muted/30">
      Potential represents all open deals; Realized is all "Won" status
      deals.
    </CardFooter>
  </Card>
</div>
      </div>
    </AppLayout>
  );
};

const AnalyticsCard = ({ title, value, trend, icon: Icon, isLoading }: any) => {
  const isPositive = trend.startsWith('+');

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-card border border-border rounded-xl p-4 shadow-apple-sm group transition-all relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {!isLoading && (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold px-2 py-[2px] rounded-full",
              isPositive
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-rose-500/10 text-rose-600"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1 relative z-10">
          <div className="h-7 w-24 bg-muted animate-pulse rounded-md" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded-md" />
        </div>
      ) : (
        <div className="relative z-10">
          <h4 className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </h4>
          <p className="text-xs font-medium text-muted-foreground mt-[2px]">
            {title}
          </p>
        </div>
      )}

      {/* Decorative background shape */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </motion.div>
  );
};
export default DashboardAnalytics;
