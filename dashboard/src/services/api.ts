import type { Building, DashboardStats, Road, Ward } from '../types';

const BASE = 'http://localhost:3000/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function put<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  get,
  post,
  put,
  patch,
  // ─── Buildings ──────────────────────────────────────────────
  getBuildings: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<{ data: Building[]; total: number }>(`/buildings${q}`);
  },
  getBuilding: (id: string) => get<Building>(`/buildings/${encodeURIComponent(id)}`),
  getBuildingHistory: (id: string) => get<any[]>(`/buildings/${encodeURIComponent(id)}/history`),
  getBuildingOwner: (id: string) => get<any[]>(`/buildings/${encodeURIComponent(id)}/owner`),
  getBuildingTaxes: (id: string) => get<any[]>(`/buildings/${encodeURIComponent(id)}/taxes`),
  getBuildingBills: (id: string) => get<any[]>(`/buildings/${encodeURIComponent(id)}/bills`),
  getBuildingGrievances: (id: string) => get<any[]>(`/buildings/${encodeURIComponent(id)}/grievances`),
  getBuildingInspections: (id: string) => get<any[]>(`/buildings/${encodeURIComponent(id)}/inspections`),

  // ─── Roads ──────────────────────────────────────────────────
  getRoads: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<{ data: Road[]; total: number }>(`/roads${q}`);
  },

  // ─── Stats ──────────────────────────────────────────────────
  getStats: () => get<DashboardStats>('/stats/summary'),
  getRevenueStats: () => get<any>('/stats/revenue'),
  getGrievanceStats: () => get<any>('/stats/grievances'),

  // ─── Admin Dashboard ────────────────────────────────────────
  getAdminHealthScore: () => get<any>('/admin/health-score'),
  getAdminActivities: () => get<any[]>('/admin/activities'),
  getAdminDeptPerformance: () => get<any[]>('/admin/department-performance'),
  getAdminInfrastructure: () => get<any[]>('/admin/infrastructure'),
  getAdminSystemHealth: () => get<any>('/admin/system-health'),
  getAdminWardStatus: () => get<any[]>('/admin/ward-status'),
  getAdminPreferences: () => get<any>('/admin/preferences'),
  saveAdminPreferences: (prefs: any) => post<any>('/admin/preferences', prefs),
  getAdminTodaySummary: () => get<any>('/admin/today-summary'),
  getAdminCriticalEvents: () => get<any[]>('/admin/critical-events'),
  getAdminPlatformHealth: () => get<any>('/admin/platform-health'),

  // ─── Department Dashboards (Module 3) ───────────────────────
  getDeptDashboard: (deptName: string) => get<any>(`/department/${deptName}/dashboard`),
  getDeptWorkOrders: (deptName: string) => get<any[]>(`/department/${deptName}/work-orders`),
  updateWorkOrderStatus: (id: string, status: string) => patch<any>(`/work-orders/${id}/status`, { status }),
  getDeptInspections: (deptName: string) => get<any[]>(`/department/${deptName}/inspections`),
  getDeptAssets: (deptName: string) => get<any[]>(`/department/${deptName}/assets`),
  getDeptGrievances: (deptName: string) => get<any[]>(`/department/${deptName}/grievances`),

  // ─── Wards ──────────────────────────────────────────────────
  getWards: () => get<Ward[]>('/wards'),

  // ─── Grievances ─────────────────────────────────────────────
  getGrievances: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<{ data: any[]; total: number }>(`/grievances${q}`);
  },
  getGrievance: (id: number) => get<any>(`/grievances/${id}`),
  createGrievance: (data: any) => post<any>('/grievances', data),
  updateGrievance: (id: number, data: any) => put<any>(`/grievances/${id}`, data),
  getGrievanceComments: (id: number) => get<any[]>(`/grievances/${id}/comments`),
  addGrievanceComment: (id: number, data: any) => post<any>(`/grievances/${id}/comments`, data),

  // ─── Notifications ──────────────────────────────────────────
  getNotifications: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<{ data: any[]; total: number }>(`/notifications${q}`);
  },
  getUnreadCount: () => get<{ count: number }>('/notifications/unread-count'),
  createNotification: (data: any) => post<any>('/notifications', data),
  markNotificationRead: (id: number) => put<any>(`/notifications/${id}/read`, {}),

  // ─── Inspections & Work Orders ──────────────────────────────
  getInspections: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<any[]>(`/inspections${q}`);
  },
  getWorkOrders: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<any[]>(`/work-orders${q}`);
  },

  // ─── Search ─────────────────────────────────────────────────
  globalSearch: (q: string) => get<any>(`/search?q=${encodeURIComponent(q)}`),

  // ─── Audit Logs ─────────────────────────────────────────────
  getAuditLogs: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return get<any[]>(`/audit-logs${q}`);
  },

  // ─── Department Data ────────────────────────────────────────
  getWater: () => get<any[]>('/water'),
  getDemographics: () => get<any[]>('/demographics'),
  getDisaster: () => get<any[]>('/disaster'),
  getIot: () => get<any[]>('/iot'),
  getElectricity: () => get<any[]>('/electricity'),
  getEnvironment: () => get<any[]>('/environment'),
  getGovernance: () => get<any[]>('/governance'),
  getSewerage: () => get<any[]>('/sewerage'),
  getTelecom: () => get<any[]>('/telecom'),
  getSocialInfrastructure: () => get<any[]>('/social-infrastructure'),
  getEconomicActivity: () => get<any[]>('/economic-activity'),
  getStormwater: () => get<any[]>('/stormwater'),
  getSolidWaste: () => get<any[]>('/solid-waste'),

  // ─── Auth ───────────────────────────────────────────────────
  login: async (username: string, password: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },
  
  // MODULE 4 API ENDPOINTS
  getWorkflowStatus: (department?: string) => {
    let url = '/workflow-status';
    if (department) url += `?department=${department}`;
    return get<any[]>(url);
  },
  updateWorkOrderDynamicStatus: (id: string, new_status_id: string, new_status_name: string) => {
    return patch<any>(`/work-orders/${id}/dynamic-status`, { new_status_id, new_status_name });
  },
  getComments: (entityType: string, entityId: string) => {
    return get<any[]>(`/comments/${entityType}/${entityId}`);
  },
  postComment: (entityType: string, entityId: string, comment: string) => {
    return post<any>(`/comments/${entityType}/${entityId}`, { comment });
  },
  getWorkOrderFinancials: (id: string) => {
    return get<any>(`/work-orders/${id}/financials`);
  },
  getTeamWorkload: (department: string) => {
    return get<any[]>(`/department/${department}/team-workload`);
  },
  getAssetHistory: (id: string) => {
    return get<any>(`/assets/${id}/history`);
  },
  getDepartmentKPIs: (department: string) => {
    return get<any>(`/analytics/department/${department}/kpis`);
  },

  // MODULE 5: CITIZEN PORTAL ENDPOINTS
  getCitizenDashboard: () => get<any>('/citizen/dashboard'),
  getCitizenProperties: () => get<any[]>('/citizen/properties'),
  getCitizenFamily: () => get<any[]>('/citizen/family'),
  getCitizenTaxes: () => get<any[]>('/citizen/taxes'),
  payCitizenTax: (invoice_id: string, amount: number) => {
    return post<any>('/citizen/taxes/pay', { invoice_id, amount });
  },
  getCitizenDocuments: () => get<any[]>('/citizen/documents'),
  getNearbyWorks: (lat: number, lon: number, radius: number = 500) => {
    return get<any[]>(`/gis/nearby-works?lat=${lat}&lon=${lon}&radius=${radius}`);
  }
};