import client from "./apiClient";

// Get available fleets for inspection
export const getAvailableFleets = (type?: string, params?: any) => {
  const requestParams: any = { ...params };

  if (type) {
    requestParams.type = type;
  }

  return client.get("/inspections/available", { params: requestParams });
};

// Get inspections by status
export const getInspectionsByStatus = (status: string, params?: any) => {
  return client.get(`/inspections/status/${status}`, { params });
};

// Create new inspection
export const createInspection = (data: any) => {
  return client.post("/inspections", data);
};

// Get inspection detail
export const getInspectionDetail = (id: string | number) => {
  return client.get(`/inspections/${id}`);
};

// Complete inspection
export const completeInspection = (fleetId: string | number) => {
  return client.patch(`/inspections/fleets/${fleetId}/complete`);
};
