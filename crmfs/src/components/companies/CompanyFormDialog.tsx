import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { companiesApi, type CompanyDto } from "@/lib/api";
import { toast } from "sonner";

interface CompanyFormProps {
  open: boolean;
  editing: CompanyDto | null;
  onClose: () => void;
  onSaved: (c: CompanyDto) => void;
}

export function CompanyFormDialog({ open, editing, onClose, onSaved }: CompanyFormProps) {
  const [form, setForm] = useState<Partial<CompanyDto>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ? { ...editing } : { name: "", website: "", industry: "", size: "" });
    }
  }, [open, editing]);

  if (!open) return null;

  const handleChange = (field: keyof CompanyDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Company name is required");
      return;
    }

    setIsLoading(true);
    try {
      let saved: CompanyDto;
      if (editing?.id) {
        saved = await companiesApi.update(editing.id, form as CompanyDto);
        toast.success("Company updated");
      } else {
        saved = await companiesApi.create(form as CompanyDto);
        toast.success("Company created");
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save company");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card rounded-2xl shadow-2xl border border-border p-8 w-full max-w-xl z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[19px] font-bold">{editing ? "Edit Company" : "New Company"}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><Plus className="w-5 h-5 rotate-45" /></button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase">Company Name *</label>
            <input className={inputClass} value={form.name ?? ""} onChange={(e) => handleChange("name", e.target.value)} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase">Website</label>
            <input className={inputClass} value={form.website ?? ""} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase">Industry</label>
            <input className={inputClass} value={form.industry ?? ""} onChange={(e) => handleChange("industry", e.target.value)} placeholder="Technology" />
          </div>
          <div className="md:col-span-2 flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-border font-semibold text-muted-foreground hover:bg-muted transition-all">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-[2] h-11 rounded-xl bg-primary text-primary-foreground font-bold transition-all">
              {isLoading ? "Saving..." : (editing ? "Update Company" : "Create Company")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
