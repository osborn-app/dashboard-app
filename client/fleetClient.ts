import client from "./apiClient";

export const getFleets = (token: string) => {
  return client.get("/fleets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateStatus = (id: string) => {
  return client.put(`/fleets/${id}/status`, {
    status: "preparation",
  });
};
