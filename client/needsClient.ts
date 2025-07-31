
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_HOST + "/maintenance";

export const createMaintenance = (data: any, token: string) =>
  axios.post(baseURL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMaintenances = (params: any, token: string) =>
  axios.get(baseURL, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMaintenanceById = (id: number, token: string) =>
  axios.get(`${baseURL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateMaintenance = (id: number, data: any, token: string) =>
  axios.patch(`${baseURL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteMaintenance = (id: number, token: string) =>
  axios.delete(`${baseURL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const markMaintenanceDone = (id: number, token: string) =>
  axios.post(`${baseURL}/${id}/done`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const manualCheckMaintenanceStatus = (token: string) =>
  axios.post(`${baseURL}/check-status`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMaintenancesByFleetId = (fleetId: number, token: string) =>
  axios.get(`${baseURL}/fleet/${fleetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });   