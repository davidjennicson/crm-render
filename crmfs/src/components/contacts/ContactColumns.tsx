import * as React from "react";
import { Mail, RefreshCw, Trash2, MoreHorizontal } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { type ContactDto } from "@/lib/api";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  INACTIVE: "bg-muted text-muted-foreground",
  BLOCKED: "bg-destructive/10 text-destructive",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
};

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function fullName(c: ContactDto): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

interface UseContactColumnsProps {
  onDelete: (id: string, e: React.MouseEvent) => void;
  deletingId: string | null;
}

export function useContactColumns({ onDelete, deletingId }: UseContactColumnsProps) {
  return React.useMemo<ColumnDef<ContactDto>[]>(() => [
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9  bg-secondary flex items-center justify-center text-[12px] font-semibold text-secondary-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {initials(c.firstName, c.lastName)}
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">{fullName(c)}</p>
              <p className="text-[12px] text-muted-foreground">{c.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "company",
      header: "Company",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div>
            <p className="text-[13px] text-foreground">{c.companyName || "—"}</p>
            <p className="text-[12px] text-muted-foreground">{c.jobTitle}</p>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <span className={`inline-flex items-center px-2.5 py-1  text-[11px] font-medium ${statusColors[c.status ?? "ACTIVE"]}`}>
            {statusLabel[c.status ?? "ACTIVE"]}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button className="p-2  hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => c.id && onDelete(c.id, e)}
              disabled={deletingId === c.id}
              className="p-2  hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              {deletingId === c.id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
            <button className="p-2  hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ], [onDelete, deletingId]);
}
