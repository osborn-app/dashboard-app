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

// Get completed inspections
export const getCompletedInspections = (params?: any) => {
  return client.get("/inspections/status/completed", { params });
};

// Complete inspection
export const completeInspection = (fleetId: string | number) => {
  return client.patch(`/inspections/fleets/${fleetId}/complete`);
};

// Get daily report
export const getDailyReport = (params?: any) => {
  return client.get("/inspections/report/daily", { params });
};

// Trigger report update
export const triggerReportUpdate = () => {
  return client.get("/inspections/report/trigger");
}; //trigger deploy
