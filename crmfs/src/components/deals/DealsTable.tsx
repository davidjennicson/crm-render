import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import type { Deal } from "@/types/crm";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

interface DealsTableProps {
  deals: Deal[];
  onEditDeal: (deal: Deal) => void;
}

const stageColors: Record<string, string> = {
  Discovery: "bg-muted-foreground/10 text-muted-foreground",
  Proposal: "bg-primary/10 text-primary",
  Negotiation: "bg-warning/10 text-warning",
  "Closed Won": "bg-success/10 text-success",
};

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

export function DealsTable({ deals, onEditDeal }: DealsTableProps) {
  const columns = React.useMemo<ColumnDef<Deal>[]>(
    () => [
      {
        id: "deal",
        header: "Deal",
        cell: ({ row }) => {
          const deal = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[11px] font-semibold text-secondary-foreground shrink-0">
                {deal.avatar}
              </div>
              <span className="text-[13px] font-medium text-foreground">{deal.title}</span>
            </div>
          );
        },
      },
      {
        id: "company",
        header: "Company",
        accessorKey: "company",
        cell: ({ row }) => <span className="text-[13px] text-foreground">{row.original.company}</span>,
      },
      {
        id: "stage",
        header: "Stage",
        accessorKey: "stage",
        cell: ({ row }) => (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium w-fit ${stageColors[row.original.stage]}`}>
            {row.original.stage}
          </span>
        ),
      },
      {
        id: "value",
        header: "Value",
        accessorKey: "value",
        cell: ({ row }) => <span className="text-[13px] font-medium text-foreground">{row.original.value}</span>,
      },
      {
        id: "priority",
        header: "Priority",
        accessorKey: "priority",
        cell: ({ row }) => (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium w-fit capitalize ${priorityColors[row.original.priority ?? "medium"]}`}>
            {row.original.priority ?? "medium"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors ml-auto block">
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={deals}
      onRowClick={onEditDeal}
      className="shadow-apple-sm"
    />
  );
}
