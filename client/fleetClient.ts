import client from "./apiClient";

export const getFleets = (token: string) => {
  return client.get("/fleets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
