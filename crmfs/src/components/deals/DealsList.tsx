import { motion } from "motion/react";
import { DollarSign, Clock, Building2, ChevronRight } from "lucide-react";
import type { Deal } from "@/types/crm";

interface DealsListProps {
  deals: Deal[];
  onEditDeal: (deal: Deal) => void;
}

const stageColors: Record<string, string> = {
  Discovery: "bg-muted-foreground",
  Proposal: "bg-primary",
  Negotiation: "bg-warning",
  "Closed Won": "bg-success",
};

export function DealsList({ deals, onEditDeal }: DealsListProps) {
  return (
    <div className="space-y-2">
      {deals.map((deal, i) => (
        <motion.div
          key={deal.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onEditDeal(deal)}
          className="bg-card rounded-xl p-4 shadow-apple-sm border border-border hover:shadow-apple-md transition-all cursor-pointer group flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-[12px] font-semibold text-secondary-foreground shrink-0">
            {deal.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold text-foreground">{deal.title}</h3>
              <div className={`w-2 h-2 rounded-full ${stageColors[deal.stage]}`} />
              <span className="text-[12px] text-muted-foreground">{deal.stage}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <Building2 className="w-3 h-3" /> {deal.company}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <DollarSign className="w-3 h-3" /> {deal.value}
              </span>
              {deal.days > 0 && (
                <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                  <Clock className="w-3 h-3" /> {deal.days}d
                </span>
              )}
            </div>
          </div>
          {deal.priority && (
            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
              deal.priority === "high" ? "bg-destructive/10 text-destructive" :
              deal.priority === "medium" ? "bg-warning/10 text-warning" :
              "bg-muted text-muted-foreground"
            }`}>
              {deal.priority}
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
}
