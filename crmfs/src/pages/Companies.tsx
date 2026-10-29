import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Building2,
  LayoutGrid,
  List,
  Upload,
} from "lucide-react";
import { AppLayout } from "@/AppLayout";
import { companiesApi, type CompanyDto } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImportWizard } from "@/components/ImportWizard";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";
import { CompanyCard } from "@/components/companies/CompanyCard";

export default function Companies() {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyDto | null>(null);
  const [importWizardOpen, setImportWizardOpen] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await companiesApi.getAll(0, 100);
      setCompanies(page.content);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleBulkImport = async (data: any[]) => {
    await companiesApi.bulkCreate(data);
    fetchCompanies();
  };

  const handleSaved = (saved: CompanyDto) => {
    setCompanies(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const up = [...prev]; up[idx] = saved; return up;
      }
      return [saved, ...prev];
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete company? Contacts won't be deleted but will lose reference.")) return;
    try {
      await companiesApi.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast.success("Company removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-foreground">Companies</h1>
            <p className="text-muted-foreground text-[14px]">Manage your corporate clients and teams</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-muted/30 p-1 rounded-xl border border-border">
              <button onClick={() => setView("list")} className={cn("p-1.5 rounded-lg transition-all", view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}><List className="w-4 h-4" /></button>
              <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-lg transition-all", view === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}><LayoutGrid className="w-4 h-4" /></button>
            </div>
            <button 
              onClick={() => setImportWizardOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-[13px] font-medium hover:bg-muted transition-colors"
            >
              <Upload className="w-4 h-4" /> Import
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Company
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-card rounded-2xl border border-border animate-pulse" />)}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-20 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No companies found. Create your first corporate client!</p>
          </div>
        ) : (
          <div className={cn("grid gap-6", view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
            {companies.map(c => (
              <CompanyCard 
                key={c.id} 
                company={c} 
                onEdit={(c) => { setEditing(c); setFormOpen(true); }} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}

        <CompanyFormDialog open={formOpen} editing={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />

        <ImportWizard
          open={importWizardOpen}
          onClose={() => setImportWizardOpen(false)}
          entityType="COMPANY"
          onImport={handleBulkImport}
          fields={[
            { key: "name", label: "Company Name", required: true },
            { key: "website", label: "Website" },
            { key: "industry", label: "Industry" },
            { key: "size", label: "Company Size" },
            { key: "phone", label: "Phone Number" },
            { key: "email", label: "Email Address" },
            { key: "address", label: "Address" },
            { key: "notes", label: "Notes" },
          ]}
        />
      </div>
    </AppLayout>
  );
}
