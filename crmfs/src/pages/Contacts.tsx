import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Filter,
  X,
  Upload,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { AppLayout } from "@/AppLayout";
import { contactsApi, type ContactDto } from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { ImportWizard } from "@/components/ImportWizard";
import { ContactFormDialog } from "@/components/contacts/ContactFormDialog";
import { useContactColumns } from "@/components/contacts/ContactColumns";
import { ContactCard } from "@/components/contacts/ContactCard";

function fullName(c: ContactDto): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

const Contacts = () => {
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "grid">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCompany, setFilterCompany] = useState("");
  const [importWizardOpen, setImportWizardOpen] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);

    try {
      let page;
      if (filterStatus !== "ALL" || filterCompany.trim()) {
        page = await contactsApi.filter({
          status: filterStatus === "ALL" ? undefined : filterStatus,
          company: filterCompany.trim() || undefined
        }, 0, 100);
      } else {
        page = await contactsApi.getAll(0, 100);
      }
      setContacts(page.content);
    } catch {
      // error handled silently — toast could be added here
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterCompany]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this contact?")) return;

    setDeletingId(id);

    try {
      await contactsApi.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contact deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete contact");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const columns = useContactColumns({ onDelete: handleDelete, deletingId });

  const filtered = contacts.filter(
    (c) =>
      fullName(c).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaved = (saved: ContactDto) => {
    setContacts((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const handleEdit = (contact: ContactDto) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleBulkImport = async (data: any[]) => {
    const contactsWithDefaults = data.map(c => ({
      ...c,
      status: c.status || "ACTIVE",
      type: c.type || "INDIVIDUAL"
    }));
    await contactsApi.bulkCreate(contactsWithDefaults);
    fetchContacts();
  };

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-[28px] font-semibold">Contacts</h1>
            <p className="text-sm md:text-[15px] text-muted-foreground mt-1">
              {contacts.length} total contacts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="flex items-center bg-muted/30 p-1  border border-border mr-2">
              <button
                onClick={() => setView("table")}
                className={`p-1.5  transition-all ${
                  view === "table"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                className={`p-1.5  transition-all ${
                  view === "grid"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={fetchContacts}
              className="p-2.5  border border-border hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setImportWizardOpen(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-card border border-border text-foreground text-[13px] font-medium hover:bg-muted transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>

            <button
              onClick={() => {
                setEditingContact(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 md:py-2.5 bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5  bg-card border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13px]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5  border border-border text-[13px] font-medium transition-all ${
                showFilters || filterStatus !== "ALL" || filterCompany
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filterStatus !== "ALL" || filterCompany) && (
                <span className="ml-1 w-2 h-2  bg-white animate-pulse" />
              )}
            </button>
          </div>

          {/* Expanded Filter Panel */}
          <motion.div
            initial={false}
            animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="bg-muted/30  border border-border p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {["ALL", "ACTIVE", "INACTIVE", "BLOCKED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5  text-[12px] font-medium transition-all ${
                        filterStatus === s
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filter by company..."
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    className="w-full bg-card border border-border  pl-9 pr-8 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {filterCompany && (
                    <button
                      onClick={() => setFilterCompany("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-end justify-end pb-1">
                <button
                  onClick={() => {
                    setFilterStatus("ALL");
                    setFilterCompany("");
                    setShowFilters(false);
                  }}
                  className="text-[12px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Table/Card View */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-card  border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card  border border-border p-16 text-center">
            <p className="text-[14px] text-muted-foreground">
              {searchQuery ? "No contacts match your search" : "No contacts yet — add your first one!"}
            </p>
          </div>
        ) : view === "table" ? (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={handleEdit}
            className="shadow-apple-sm"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}

        <ContactFormDialog
          open={formOpen}
          editing={editingContact}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />

        <ImportWizard
          open={importWizardOpen}
          onClose={() => setImportWizardOpen(false)}
          entityType="CONTACT"
          onImport={handleBulkImport}
          fields={[
            { key: "firstName", label: "First Name", required: true },
            { key: "lastName", label: "Last Name", required: true },
            { key: "email", label: "Email Address", required: true },
            { key: "phone", label: "Phone Number" },
            { key: "jobTitle", label: "Job Title" },
            { key: "address", label: "Address" },
            { key: "notes", label: "Notes" },
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default Contacts;