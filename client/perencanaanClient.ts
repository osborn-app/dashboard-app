import client from "./apiClient";

// ===== PLANNING PLANS API =====
export const getPerencanaan = (params?: any) => {
  return client.get("/api/v1/planning/plans", { params });
};

export const getPerencanaanById = (id: string | number) => {
  return client.get(`/api/v1/planning/plans/${id}`);
};

export const createPerencanaan = (data: any) => {
  return client.post("/api/v1/planning/plans", data);
};

export const updatePerencanaan = (id: string | number, data: any) => {
  return client.patch(`/api/v1/planning/plans/${id}`, data);
};

export const deletePerencanaan = (id: string | number) => {
  return client.delete(`/api/v1/planning/plans/${id}`);
};

// ===== PLANNING ENTRIES API =====
export const getPlanningEntries = (planningId: string | number, params?: any) => {
  return client.get(`/api/v1/planning/${planningId}/entries`, { params });
};

export const createPlanningEntry = (planningId: string | number, data: any) => {
  return client.post(`/api/v1/planning/${planningId}/entries`, data);
};

export const updatePlanningEntry = (planningId: string | number, entryId: string | number, data: any) => {
  return client.patch(`/api/v1/planning/${planningId}/entries/${entryId}`, data);
};

export const deletePlanningEntry = (planningId: string | number, entryId: string | number) => {
  return client.delete(`/api/v1/planning/${planningId}/entries/${entryId}`);
};

// ===== PLANNING ACCOUNTS API =====
export const getPlanningAccounts = (params?: any) => {
  return client.get("/api/v1/planning/accounts", { params });
};

// ===== PLANNING REPORTS API =====
export const getLabaRugiReport = (planningId: string | number, params?: any) => {
  return client.get(`/api/v1/planning/reports/laba-rugi`, { 
    params: { planning_id: planningId, ...params } 
  });
};

export const getNeracaReport = (planningId: string | number, params?: any) => {
  return client.get(`/api/v1/planning/reports/neraca`, { 
    params: { planning_id: planningId, ...params } 
  });
};

export const getArusKasReport = (planningId: string | number, params?: any) => {
  return client.get(`/api/v1/planning/reports/arus-kas`, { 
    params: { planning_id: planningId, ...params } 
  });
};

