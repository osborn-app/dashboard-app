import client from "./apiClient";

export const getFleets = (token: string) => {
  return client.get("/fleets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateStatusToPreparation = (id: string) => {
  return client.put(`/fleets/${id}/status`, {
    status: "preparation",
  });
};

export const updateStatusToAvailable = (id: string) => {
  return client.put(`/fleets/${id}/status`, {
    status: "available",
  });
};
