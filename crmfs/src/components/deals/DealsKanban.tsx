import { motion } from "motion/react";
import { MoreHorizontal, Clock, DollarSign, GripVertical } from "lucide-react";
import type { Deal } from "@/types/crm";
import { useState } from "react";

interface DealsKanbanProps {
  deals: Deal[];
  onEditDeal: (deal: Deal) => void;
  onUpdateDeals: (deals: Deal[]) => void;
}

const stageConfig: Record<string, string> = {
  Discovery: "bg-muted-foreground",
  Proposal: "bg-primary",
  Negotiation: "bg-warning",
  "Closed Won": "bg-success",
};

const stageOrder = ["Discovery", "Proposal", "Negotiation", "Closed Won"];

export function DealsKanban({ deals, onEditDeal, onUpdateDeals }: DealsKanbanProps) {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (deal: Deal) => setDraggedDeal(deal);

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (stage: string) => {
    if (draggedDeal && draggedDeal.stage !== stage) {
      onUpdateDeals(deals.map(d => d.id === draggedDeal.id ? { ...d, stage } : d));
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-[calc(100vh-220px)]">
      {stageOrder.map((stage, si) => {
        const stageDeals = deals.filter(d => d.stage === stage);
        return (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
            className={`flex flex-col rounded-xl transition-colors ${dragOverStage === stage ? "bg-primary/5" : ""}`}
            onDragOver={e => handleDragOver(e, stage)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => handleDrop(stage)}
          >
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className={`w-2 h-2 rounded-full ${stageConfig[stage]}`} />
              <span className="text-[13px] font-semibold text-foreground">{stage}</span>
              <span className="text-[12px] text-muted-foreground ml-auto">{stageDeals.length}</span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-auto">
              {stageDeals.map((deal, di) => (
                <motion.div
                  key={deal.id}
                  draggable
                  onDragStart={() => handleDragStart(deal)}
                  onDragEnd={() => { setDraggedDeal(null); setDragOverStage(null); }}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: si * 0.08 + di * 0.05 }}
                  className={`bg-card rounded-xl p-4 shadow-apple-sm border border-border hover:shadow-apple-md transition-all cursor-grab active:cursor-grabbing group ${draggedDeal?.id === deal.id ? "opacity-50" : ""}`}
                  onClick={() => onEditDeal(deal)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div>
                        <h3 className="text-[13px] font-semibold text-foreground">{deal.title}</h3>
                        <p className="text-[12px] text-muted-foreground">{deal.company}</p>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[12px] font-medium text-foreground">{deal.value}</span>
                    </div>
                    {deal.days > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">{deal.days}d</span>
                      </div>
                    )}
                  </div>
                  {deal.priority && (
                    <div className="mt-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        deal.priority === "high" ? "bg-destructive/10 text-destructive" :
                        deal.priority === "medium" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {deal.priority}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-semibold text-secondary-foreground">
                      {deal.avatar}
                    </div>
                    <span className="text-[11px] text-muted-foreground">Owner</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
