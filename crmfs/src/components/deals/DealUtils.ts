import { type LeadDto, type LeadStatus } from "@/lib/api";
import type { Deal } from "@/types/crm";

export const STATUS_TO_STAGE: Record<LeadStatus, string> = {
  NEW: "Discovery",
  CONTACTED: "Discovery",
  QUALIFIED: "Discovery",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Closed Won",
  LOST: "Closed Lost",
};

export const STAGE_TO_STATUS: Record<string, LeadStatus> = {
  Discovery: "NEW",
  Proposal: "PROPOSAL",
  Negotiation: "NEGOTIATION",
  "Closed Won": "WON",
  "Closed Lost": "LOST",
};

export function leadToUIDeal(lead: LeadDto): Deal & { _raw: LeadDto } {
  const initials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "??";
  return {
    id: lead.id ?? "",
    title: lead.title,
    company: lead.contactName ?? "—",
    value: lead.value ? `$${lead.value.toLocaleString()}` : "$0",
    days: lead.createdAt
      ? Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86_400_000)
      : 0,
    avatar: initials(lead.assignedToName ?? lead.contactName),
    stage: STATUS_TO_STAGE[lead.status ?? "NEW"] ?? "Discovery",
    description: lead.description,
    priority: "medium",
    _raw: lead,
  } as Deal & { _raw: LeadDto };
}
