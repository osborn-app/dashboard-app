import client from "./apiClient";
import { 
  OutOfTownRate, 
  CreateOutOfTownRateData, 
  UpdateOutOfTownRateData,
  OutOfTownRateResponse,
  OutOfTownRateStatusCount 
} from "@/hooks/api/useOutOfTownRates";

export const getOutOfTownRates = (params?: any) => {
  return client.get<OutOfTownRateResponse>("/out-of-town-rates", { params });
};

export const getOutOfTownRateById = (id: number) => {
  return client.get<{ data: OutOfTownRate }>(`/out-of-town-rates/${id}`);
};

export const createOutOfTownRate = (data: CreateOutOfTownRateData) => {
  return client.post<{ data: OutOfTownRate }>("/out-of-town-rates", data);
};

export const updateOutOfTownRate = (id: number, data: UpdateOutOfTownRateData) => {
  return client.patch<{ data: OutOfTownRate }>(`/out-of-town-rates/${id}`, data);
};

export const deleteOutOfTownRate = (id: number) => {
  return client.delete(`/out-of-town-rates/${id}`);
};

export const toggleOutOfTownRateStatus = (id: number, is_active: boolean) => {
  return client.patch(`/out-of-town-rates/${id}/toggle-status`, { is_active });
};

export const getOutOfTownRatesStatusCount = () => {
  return client.get<{ data: OutOfTownRateStatusCount }>("/out-of-town-rates/status/count");
};
