import { motion } from "framer-motion";
import { Building2, Globe, Phone, Pencil, Trash2 } from "lucide-react";
import { type CompanyDto } from "@/lib/api";

interface CompanyCardProps {
  company: CompanyDto;
  onEdit: (c: CompanyDto) => void;
  onDelete: (id: string) => void;
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  return (
    <motion.div layout className="group bg-card rounded-2xl border border-border p-6 hover:shadow-apple-md transition-all relative">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(company)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(company.id!)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-bold mb-1 truncate">{company.name}</h3>
      <p className="text-[13px] text-muted-foreground mb-4">{company.industry || "No industry set"}</p>
      <div className="space-y-2.5">
        {company.website && (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Globe className="w-3.5 h-3.5" /> {company.website}
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Phone className="w-3.5 h-3.5" /> {company.phone}
          </div>
        )}
      </div>
    </motion.div>
  );
}
