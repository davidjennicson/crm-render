import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { leadsApi, type LeadDto, type LeadStatus, type LeadSource } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  open: boolean;
  editing: LeadDto | null;
  onClose: () => void;
  onSaved: (lead: LeadDto) => void;
}

const STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
const SOURCES: LeadSource[] = ["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "EMAIL_CAMPAIGN", "COLD_CALL", "TRADE_SHOW", "OTHER"];

export function LeadFormDialog({ open, editing, onClose, onSaved }: LeadFormProps) {
  const [form, setForm] = useState<Partial<LeadDto>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? { ...editing }
          : { title: "", description: "", value: 0, status: "NEW", source: "OTHER" }
      );
    }
  }, [open, editing]);

  if (!open) return null;

  const handleChange = (field: keyof LeadDto, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsLoading(true);
    try {
      let saved: LeadDto;
      if (editing?.id) {
        saved = await leadsApi.update(editing.id, form as LeadDto);
        toast.success("Deal updated");
      } else {
        saved = await leadsApi.create(form as LeadDto);
        toast.success("Deal created");
      }
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save deal");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card rounded-2xl shadow-2xl border border-border p-8 w-full max-w-2xl z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[19px] font-bold text-foreground">
            {editing ? "Edit Deal" : "Create New Deal"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Title *</label>
              <input className={inputClass} value={form.title ?? ""} onChange={(e) => handleChange("title", e.target.value)} placeholder="e.g. Enterprise License Expansion" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Deal Value ($)</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.value ?? ""}
                onChange={(e) => handleChange("value", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Status</label>
              <select
                className={inputClass}
                value={form.status ?? "NEW"}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Source</label>
              <select
                className={inputClass}
                value={form.source ?? "OTHER"}
                onChange={(e) => handleChange("source", e.target.value)}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Close Date</label>
              <input
                className={inputClass}
                type="date"
                value={form.expectedCloseDate ?? ""}
                onChange={(e) => handleChange("expectedCloseDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Description</label>
              <textarea 
                className={cn(inputClass, "h-20 py-3 resize-none")} 
                value={form.description ?? ""} 
                onChange={(e) => handleChange("description", e.target.value)} 
                placeholder="What is this deal about?" 
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Internal Notes</label>
              <textarea 
                className={cn(inputClass, "h-20 py-3 resize-none")} 
                value={form.notes ?? ""} 
                onChange={(e) => handleChange("notes", e.target.value)} 
                placeholder="Add any internal details or context..." 
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border text-[14px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:border-muted-foreground/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] h-11 rounded-xl bg-primary text-primary-foreground text-[14px] font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60 disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : editing ? "Update Deal" : "Create Deal"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
