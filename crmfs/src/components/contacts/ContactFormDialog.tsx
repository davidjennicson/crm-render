import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { contactsApi, companiesApi, type ContactDto, type CompanyDto } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface ContactFormProps {
  open: boolean;
  editing: ContactDto | null;
  onClose: () => void;
  onSaved: (c: ContactDto) => void;
}

export function ContactFormDialog({
  open,
  editing,
  onClose,
  onSaved,
}: ContactFormProps) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [form, setForm] = useState<Partial<ContactDto>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      companiesApi.getAll(0, 50).then((page) => setCompanies(page.content));
      setForm(
        editing
          ? { ...editing }
          : {
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              companyId: "",
              jobTitle: "",
              status: "ACTIVE",
              type: "INDIVIDUAL",
            }
      );
    }
  }, [open, editing]);

  if (!open) return null;

  const handleChange = (field: keyof ContactDto, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim()) {
      toast.error("First name, last name, and email are required");
      return;
    }

    setIsLoading(true);

    try {
      let saved: ContactDto;

      const payload = { ...form };
      if (payload.companyId === "none") payload.companyId = undefined;

      if (editing?.id) {
        saved = await contactsApi.update(editing.id, payload as ContactDto);
        toast.success("Contact updated");
      } else {
        saved = await contactsApi.create(payload as ContactDto);
        toast.success("Contact created");
      }

      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2  border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-card  shadow-2xl border border-border p-8 w-full max-w-2xl z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[19px] font-bold text-foreground">
            {editing ? "Edit Contact" : "Add New Contact"}
          </h2>
          <button onClick={onClose} className="p-1  hover:bg-muted text-muted-foreground transition-colors">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              First name *
            </label>
            <input
              className={inputClass}
              value={form.firstName ?? ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="John"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Last name *
            </label>
            <input
              className={inputClass}
              value={form.lastName ?? ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Doe"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Email *
            </label>
            <input
              type="email"
              className={inputClass}
              value={form.email ?? ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Phone
            </label>
            <input
              className={inputClass}
              value={form.phone ?? ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 555-0100"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Type
            </label>
            <Select
              value={form.type ?? "INDIVIDUAL"}
              onValueChange={(val) => handleChange("type", val)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="COMPANY_REPRESENTATIVE">Company Representative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Company
            </label>
            <Select
              value={form.companyId ?? "none"}
              onValueChange={(val) => handleChange("companyId", val)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select company">
                  {form.companyId && form.companyId !== "none" 
                    ? (companies.find(c => c.id === form.companyId)?.name || form.companyName || form.companyId)
                    : (form.companyId === "none" ? "No Company (Personal)" : "Select company")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Company (Personal)</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id!}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Job Title
            </label>
            <input
              className={inputClass}
              value={form.jobTitle ?? ""}
              onChange={(e) => handleChange("jobTitle", e.target.value)}
              placeholder="VP of Sales"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Status
            </label>
            <Select
              value={form.status ?? "ACTIVE"}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider">
              Notes
            </label>
            <textarea
              className={cn(inputClass, "h-20 py-3 resize-none")}
              value={form.notes ?? ""}
              onChange={(e) => handleChange("notes", (e.target as any).value)}
              placeholder="Optional notes..."
            />
          </div>

          <div className="md:col-span-2 flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11  border border-border text-[14px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:border-muted-foreground/30"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] h-11  bg-primary text-primary-foreground text-[14px] font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60 disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : editing ? "Update Contact" : "Create Contact"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
