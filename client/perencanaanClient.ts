import client from "./apiClient";

// ===== PLANNING PLANS API =====
export const getPerencanaan = (params?: any) => {
  return client.get("/planning/plans", { params });
};

export const getPerencanaanById = (id: string | number) => {
  return client.get(`/planning/plans/${id}`);
};

export const createPerencanaan = (data: any) => {
  return client.post("/planning/plans", data);
};

export const updatePerencanaan = (id: string | number, data: any) => {
  return client.patch(`/planning/plans/${id}`, data);
};

export const deletePerencanaan = (id: string | number) => {
  return client.delete(`/planning/plans/${id}`);
};

// ===== PLANNING ENTRIES API =====
export const getPlanningEntries = (planningId: string | number, params?: any) => {
  return client.get(`/planning/${planningId}/entries`, { params });
};

export const createPlanningEntry = (planningId: string | number, data: any) => {
  return client.post(`/planning/${planningId}/entries`, data);
};

export const updatePlanningEntry = (planningId: string | number, entryId: string | number, data: any) => {
  return client.patch(`/planning/${planningId}/entries/${entryId}`, data);
};

export const deletePlanningEntry = (planningId: string | number, entryId: string | number) => {
  return client.delete(`/planning/${planningId}/entries/${entryId}`);
};

// ===== PLANNING ACCOUNTS API =====
export const getPlanningAccounts = (params?: any) => {
  return client.get("/planning/accounts", { params });
};

// ===== PLANNING REPORTS API =====
export const getLabaRugiReport = (params?: any) => {
  return client.get(`/planning/reports/laba-rugi`, { params });
};

export const getNeracaReport = (params?: any) => {
  return client.get(`/planning/reports/neraca`, { params });
};

export const getArusKasReport = (params?: any) => {
  return client.get(`/planning/reports/arus-kas`, { params });
};

