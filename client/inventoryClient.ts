import client from "./apiClient";

export const getInventory = (params?: any) => {
  return client.get("/inventory", { params });
};

export const getInventoryById = (id: string | number) => {
  return client.get(`/inventory/${id}`);
};

export const createInventory = (data: any) => {
  return client.post("/inventory", data);
};

export const updateInventory = (id: string | number, data: any) => {
  return client.patch(`/inventory/${id}`, data);
};

export const updateInventoryStatus = (id: string | number, data: any) => {
  return client.patch(`/inventory/${id}/status`, data);
};

export const bulkUpdateInventoryStatus = (data: { ids: number[]; status: string }) => {
  return client.post("/inventory/bulk-update-status", data);
};

export const deleteInventory = (id: string | number) => {
  return client.delete(`/inventory/${id}`);
};

export const getInventoryStatistics = () => {
  return client.get("/inventory/statistics");
};