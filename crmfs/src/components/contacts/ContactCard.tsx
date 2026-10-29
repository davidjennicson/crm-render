import { motion } from "framer-motion";
import { Mail, Phone, Building2, RefreshCw, Trash2 } from "lucide-react";
import { type ContactDto } from "@/lib/api";

interface ContactCardProps {
  contact: ContactDto;
  onEdit: (c: ContactDto) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  deletingId: string | null;
}

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

export function ContactCard({ contact, onEdit, onDelete, deletingId }: ContactCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => onEdit(contact)}
      className="bg-card  border border-border p-5 hover:shadow-apple-md transition-all cursor-pointer group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12  bg-secondary flex items-center justify-center text-[14px] font-semibold text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {initials(contact.firstName, contact.lastName)}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors">
              {fullName(contact)}
            </h3>
            <p className="text-[12px] text-muted-foreground">{contact.jobTitle || "No title"}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1  text-[11px] font-medium ${statusColors[contact.status ?? "ACTIVE"]}`}>
          {statusLabel[contact.status ?? "ACTIVE"]}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span className="truncate">{contact.email}</span>
        </div>
        {contact.phone && (
          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{contact.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>{contact.companyName || "Personal"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div className="flex items-center gap-1">
          <button className="p-2  hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="w-4 h-4" />
          </button>
          <button className="p-2  hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => {
              e.stopPropagation();
              // Potential call action
          }}>
            <Phone className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={(e) => contact.id && onDelete(contact.id, e)}
          disabled={deletingId === contact.id}
          className="p-2  hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          {deletingId === contact.id ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
