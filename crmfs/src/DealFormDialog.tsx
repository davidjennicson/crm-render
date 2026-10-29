import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Deal } from "@/types/crm";

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  onSave: (deal: Omit<Deal, "id"> & { id?: string }) => void;
}

const stages = ["Discovery", "Proposal", "Negotiation", "Closed Won"];
const priorities = ["low", "medium", "high"] as const;

export function DealFormDialog({ open, onOpenChange, deal, onSave }: DealFormDialogProps) {
  const [title, setTitle] = useState(deal?.title ?? "");
  const [company, setCompany] = useState(deal?.company ?? "");
  const [value, setValue] = useState(deal?.value ?? "");
  const [stage, setStage] = useState(deal?.stage ?? "Discovery");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(deal?.priority ?? "medium");
  const [description, setDescription] = useState(deal?.description ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;
    onSave({
      ...(deal?.id ? { id: deal.id } : {}),
      title: title.trim(),
      company: company.trim(),
      value: value || "$0",
      stage,
      priority,
      description,
      days: deal?.days ?? 0,
      avatar: company.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold text-foreground">
            {deal ? "Edit Deal" : "New Deal"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-muted-foreground">Deal Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enterprise Suite" className="rounded-xl bg-muted border-border text-[13px]" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Company</Label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" className="rounded-xl bg-muted border-border text-[13px]" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Value</Label>
              <Input value={value} onChange={e => setValue(e.target.value)} placeholder="$120K" className="rounded-xl bg-muted border-border text-[13px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Stage</Label>
              <Select value={stage} onValueChange={(v) => { if (v) setStage(v); }}>
                <SelectTrigger className="rounded-xl bg-muted border-border text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={v => setPriority(v as typeof priority)}>
                <SelectTrigger className="rounded-xl bg-muted border-border text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] text-muted-foreground">Description</Label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Deal details..." className="w-full rounded-xl bg-muted border border-border text-[13px] p-3 h-20 resize-none outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity">
              {deal ? "Save Changes" : "Create Deal"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
