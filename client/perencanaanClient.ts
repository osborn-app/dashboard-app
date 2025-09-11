import client from "./apiClient";

export const getPerencanaan = (params?: any) => {
  return client.get("/perencanaan", { params });
};

export const getPerencanaanById = (id: string | number) => {
  return client.get(`/perencanaan/${id}`);
};

export const createPerencanaan = (data: any) => {
  return client.post("/perencanaan", data);
};

export const updatePerencanaan = (id: string | number, data: any) => {
  return client.patch(`/perencanaan/${id}`, data);
};

export const deletePerencanaan = (id: string | number) => {
  return client.delete(`/perencanaan/${id}`);
};

export const getPerencanaanStatistics = () => {
  return client.get("/perencanaan/statistics");
};
