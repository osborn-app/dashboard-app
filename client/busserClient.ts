import client from "./apiClient";

export const getBussersByStatus = (status: string, params?: any) => {
  return client.get(`/busser/status/${status}`, { params });
};

export const resolveBusser = (id: string | number, notes?: string) => {
  return client.patch(`/busser/${id}/resolve`, { notes });
};

export const updateBusserStatus = (id: string | number, status: string) => {
  return client.patch(`/busser/${id}`, { status });
};

export const assignBusserTask = (
  id: string | number,
  investigatorId: number,
) => {
  return client.patch(`/busser/${id}/assign`, { investigatorId });
};
