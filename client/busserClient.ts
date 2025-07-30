import apiClient from "./apiClient";
// import axios from "axios";

// // Gunakan axios langsung untuk endpoint buser tanpa /v1
// export const getBussersByStatus = (status: string, params?: any) => {
//   return axios.get(`https://dev.api.transgo.id/api/v1/busser/status/${status}`, { params });
// };

// Jika ingin tetap pakai apiClient untuk endpoint lain, jangan dihapus, cukup comment
// export const getBussersByStatus = (status: string, params?: any) => {
//   return apiClient.get(`/api/busser/status/${status}`, { params });
// };

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

export const assignBusserTask = (id: string | number, investigatorId: number) => {
  return client.patch(`/busser/${id}/assign`, { investigatorId });
};