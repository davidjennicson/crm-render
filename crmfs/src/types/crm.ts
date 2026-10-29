export interface Deal {
  id: string;
  title: string;
  company: string;
  value: string;
  days: number;
  avatar: string;
  stage: string;
  description?: string;
  priority?: "low" | "medium" | "high";
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  companyId?: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  type: "INDIVIDUAL" | "COMPANY_REPRESENTATIVE";
  phone?: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition" | "delay" | "ai";
  title: string;
  description: string;
  x: number;
  y: number;
  config?: Record<string, string>;
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  active: boolean;
  lastEdited: string;
}
