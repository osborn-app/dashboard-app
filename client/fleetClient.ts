import client from "./apiClient";

export const getFleets = () => {
  return client.get("/fleets");
};

export const updateStatus = (id: string) => {
  return client.put(`/fleets/${id}/status`);
};