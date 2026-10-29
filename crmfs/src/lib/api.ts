
// ─── API Base & Helpers ────────────────────────────────────────────────────

const BASE_URL = "/api/v1";

/** Read the access token stored after login */
function getToken(): string | null {
  return localStorage.getItem("accessToken");
}

/** Attach Authorization header when a token exists */
function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message ?? body.error ?? msg;
    } catch {
      // keep default msg
    }
    throw new Error(msg);
  }
  // 204 No Content has no body
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  gender?: string;
  address?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  role?: string;
  setupCompleted?: boolean;
  provider?: string;
  createdAt?: string;
  roles?: { name: string }[];
}

// ─── CRM Types ─────────────────────────────────────────────────────────────

export type ContactStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type ContactType = "INDIVIDUAL" | "COMPANY_REPRESENTATIVE";

export interface ContactDto {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  address?: string;
  notes?: string;
  status?: ContactStatus;
  type?: ContactType;
  companyId?: string;
  companyName?: string;
  ownerId?: string;
  ownerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyDto {
  id?: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type LeadSource = "WEBSITE" | "REFERRAL" | "SOCIAL_MEDIA" | "EMAIL_CAMPAIGN" | "COLD_CALL" | "TRADE_SHOW" | "OTHER";

export interface LeadDto {
  id?: string;
  title: string;
  description?: string;
  value?: number;
  status?: LeadStatus;
  source?: LeadSource;
  expectedCloseDate?: string;
  notes?: string;
  contactId?: string;
  contactName?: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsDto {
  totalContacts: number;
  activeContacts: number;
  inactiveContacts: number;
  totalLeads: number;
  newLeads: number;
  wonLeads: number;
  lostLeads: number;
  openLeads: number;
  totalPipelineValue: number;
  totalWonValue: number;
  conversionRate: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  contactsByStatus: Record<string, number>;
  totalUsers: number;
}

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskDto {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  assignedToName?: string;
  leadId?: string;
  leadTitle?: string;
  teamId?: string;
  teamName?: string;
  createdById?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamDto {
  id?: string;
  name: string;
  description?: string;
  ownerId?: string;
  ownerName?: string;
  memberIds?: string[];
  memberNames?: string[];
  createdAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ─── Auth API ─────────────────────────────────────────────────────────────

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<AuthResponse>(res);
  },

  async register(data: RegisterRequest): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<UserProfile>(res);
  },

  async logout(): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
    });
    return handleResponse<void>(res);
  },

  async refreshToken(): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse<AuthResponse>(res);
  },
};

// ─── Contacts API ─────────────────────────────────────────────────────────

export const contactsApi = {
  async getAll(page = 0, size = 50): Promise<Page<ContactDto>> {
    const res = await fetch(
      `${BASE_URL}/contacts?page=${page}&size=${size}`,
      { headers: authHeaders() }
    );
    return handleResponse<Page<ContactDto>>(res);
  },

  async search(query: string, page = 0, size = 50): Promise<Page<ContactDto>> {
    const res = await fetch(
      `${BASE_URL}/contacts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`,
      { headers: authHeaders() }
    );
    return handleResponse<Page<ContactDto>>(res);
  },

  async filter(filters: { status?: string; company?: string }, page = 0, size = 50): Promise<Page<ContactDto>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (filters.status) params.append("status", filters.status);
    if (filters.company) params.append("company", filters.company);

    const res = await fetch(`${BASE_URL}/contacts/filter?${params.toString()}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<ContactDto>>(res);
  },

  async getById(id: string): Promise<ContactDto> {
    const res = await fetch(`${BASE_URL}/contacts/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<ContactDto>(res);
  },

  async create(data: ContactDto): Promise<ContactDto> {
    const res = await fetch(`${BASE_URL}/contacts`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ContactDto>(res);
  },

  async update(id: string, data: ContactDto): Promise<ContactDto> {
    const res = await fetch(`${BASE_URL}/contacts/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ContactDto>(res);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/contacts/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },

  async import(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${BASE_URL}/contacts/import`, {
      method: "POST",
      headers,
      body: formData,
    });
    // fetch will automatically set the correct Content-Type with the boundary
    if (!res.ok) {
        throw new Error(`Import failed: ${await res.text()}`);
    }
  },

  async bulkCreate(data: ContactDto[]): Promise<ContactDto[]> {
    const res = await fetch(`${BASE_URL}/contacts/bulk`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ContactDto[]>(res);
  },
};

// ─── Companies API ────────────────────────────────────────────────────────

export const companiesApi = {
  async getAll(page = 0, size = 50): Promise<Page<CompanyDto>> {
    const res = await fetch(
      `${BASE_URL}/companies?page=${page}&size=${size}`,
      { headers: authHeaders() }
    );
    return handleResponse<Page<CompanyDto>>(res);
  },

  async search(query: string, page = 0, size = 50): Promise<Page<CompanyDto>> {
    const res = await fetch(
      `${BASE_URL}/companies/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`,
      { headers: authHeaders() }
    );
    return handleResponse<Page<CompanyDto>>(res);
  },

  async getById(id: string): Promise<CompanyDto> {
    const res = await fetch(`${BASE_URL}/companies/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<CompanyDto>(res);
  },

  async create(data: CompanyDto): Promise<CompanyDto> {
    const res = await fetch(`${BASE_URL}/companies`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CompanyDto>(res);
  },

  async update(id: string, data: CompanyDto): Promise<CompanyDto> {
    const res = await fetch(`${BASE_URL}/companies/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CompanyDto>(res);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/companies/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },

  async import(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${BASE_URL}/companies/import`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
        throw new Error(`Import failed: ${await res.text()}`);
    }
  },

  async bulkCreate(data: CompanyDto[]): Promise<CompanyDto[]> {
    const res = await fetch(`${BASE_URL}/companies/bulk`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CompanyDto[]>(res);
  },
};

// ─── Leads (Deals) API ────────────────────────────────────────────────────

export const leadsApi = {
  async getAll(page = 0, size = 50, sort?: string): Promise<Page<LeadDto>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (sort) {
      params.append("sort", sort);
    }

    const res = await fetch(`${BASE_URL}/leads?${params.toString()}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<LeadDto>>(res);
  },

  async getById(id: string): Promise<LeadDto> {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<LeadDto>(res);
  },

  async create(data: LeadDto): Promise<LeadDto> {
    const res = await fetch(`${BASE_URL}/leads`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<LeadDto>(res);
  },

  async update(id: string, data: LeadDto): Promise<LeadDto> {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<LeadDto>(res);
  },

  async updateStatus(id: string, status: LeadStatus): Promise<LeadDto> {
    const res = await fetch(
      `${BASE_URL}/leads/${id}/status?status=${status}`,
      { method: "PATCH", headers: authHeaders() }
    );
    return handleResponse<LeadDto>(res);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },

  async getForTeam(teamId: string, page = 0, size = 50, sort?: string): Promise<Page<LeadDto>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (sort) params.append("sort", sort);
    const res = await fetch(`${BASE_URL}/leads/team/${teamId}?${params.toString()}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<LeadDto>>(res);
  },
};

// ─── Analytics API ────────────────────────────────────────────────────────

export const analyticsApi = {
  async getDashboard(): Promise<AnalyticsDto> {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: authHeaders(),
    });
    return handleResponse<AnalyticsDto>(res);
  },
};

// ─── Tasks API ─────────────────────────────────────────────────────────────

export const tasksApi = {
  async getDashboard(limit = 10): Promise<TaskDto[]> {
    const res = await fetch(`${BASE_URL}/tasks/dashboard?limit=${limit}`, {
      headers: authHeaders(),
    });
    return handleResponse<TaskDto[]>(res);
  },
  async getVisible(page = 0, size = 20): Promise<Page<TaskDto>> {
    const res = await fetch(`${BASE_URL}/tasks?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<TaskDto>>(res);
  },
  async getMy(page = 0, size = 20): Promise<Page<TaskDto>> {
    const res = await fetch(`${BASE_URL}/tasks/my?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<TaskDto>>(res);
  },
  async getByTeam(teamId: string, page = 0, size = 20): Promise<Page<TaskDto>> {
    const res = await fetch(`${BASE_URL}/tasks/team/${teamId}?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<TaskDto>>(res);
  },
  async getById(id: string): Promise<TaskDto> {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, { headers: authHeaders() });
    return handleResponse<TaskDto>(res);
  },
  async create(data: TaskDto): Promise<TaskDto> {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<TaskDto>(res);
  },
  async update(id: string, data: TaskDto): Promise<TaskDto> {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<TaskDto>(res);
  },
  async updateStatus(id: string, status: TaskStatus): Promise<TaskDto> {
    const res = await fetch(`${BASE_URL}/tasks/${id}/status?status=${status}`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return handleResponse<TaskDto>(res);
  },
  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ─── Teams API ────────────────────────────────────────────────────────────

export const teamsApi = {
  async getAll(page = 0, size = 20): Promise<Page<TeamDto>> {
    const res = await fetch(`${BASE_URL}/teams?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<TeamDto>>(res);
  },
  async getById(id: string): Promise<TeamDto> {
    const res = await fetch(`${BASE_URL}/teams/${id}`, { headers: authHeaders() });
    return handleResponse<TeamDto>(res);
  },
  async create(data: TeamDto): Promise<TeamDto> {
    const res = await fetch(`${BASE_URL}/teams`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<TeamDto>(res);
  },
  async update(id: string, data: TeamDto): Promise<TeamDto> {
    const res = await fetch(`${BASE_URL}/teams/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<TeamDto>(res);
  },
  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/teams/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
  async addMember(teamId: string, userId: string): Promise<TeamDto> {
    const res = await fetch(`${BASE_URL}/teams/${teamId}/members/${userId}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handleResponse<TeamDto>(res);
  },
  async removeMember(teamId: string, userId: string): Promise<TeamDto> {
    const res = await fetch(`${BASE_URL}/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<TeamDto>(res);
  },
};

// ─── Users API ────────────────────────────────────────────────────────────

export const userApi = {
  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: authHeaders(),
    });
    return handleResponse<UserProfile>(res);
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/users/me`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<UserProfile>(res);
  },
};
