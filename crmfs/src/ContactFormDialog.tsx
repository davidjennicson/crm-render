import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Legacy contact shape used by this dialog (separate from the API ContactDto)
interface LegacyContact {
  id?: string;
  name: string;
  email: string;
  company: string;
  role: string;
  phone?: string;
  status: "Active" | "Lead" | "Prospect";
  value?: string;
  avatar?: string;
}

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: LegacyContact | null;
  onSave: (contact: LegacyContact) => void;
}

const statuses = ["Active", "Lead", "Prospect"] as const;

export function ContactFormDialog({ open, onOpenChange, contact, onSave }: ContactFormDialogProps) {
  const [name, setName] = useState(contact?.name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [company, setCompany] = useState(contact?.company ?? "");
  const [role, setRole] = useState(contact?.role ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [status, setStatus] = useState<LegacyContact["status"]>(contact?.status ?? "Lead");
  const [value, setValue] = useState(contact?.value ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({
      ...(contact?.id ? { id: contact.id } : {}),
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      role: role.trim(),
      phone,
      status,
      value: value || "$0",
      avatar: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold text-foreground">
            {contact ? "Edit Contact" : "New Contact"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Chen" className="rounded-xl bg-muted border-border text-[13px]" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@acme.com" className="rounded-xl bg-muted border-border text-[13px]" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Company</Label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" className="rounded-xl bg-muted border-border text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Role</Label>
              <Input value={role} onChange={e => setRole(e.target.value)} placeholder="VP of Sales" className="rounded-xl bg-muted border-border text-[13px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="rounded-xl bg-muted border-border text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as LegacyContact["status"])}>
                <SelectTrigger className="rounded-xl bg-muted border-border text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] text-muted-foreground">Deal Value</Label>
            <Input value={value} onChange={e => setValue(e.target.value)} placeholder="$120K" className="rounded-xl bg-muted border-border text-[13px]" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity">
              {contact ? "Save Changes" : "Add Contact"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
