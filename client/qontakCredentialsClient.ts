import client from "./apiClient";

const baseEndpoint = "/qontak-credentials";

export const getQontakCredentials = () => {
  return client.get(baseEndpoint);
};

export const getActiveQontakCredential = () => {
  return client.get(`${baseEndpoint}/active`);
};

export const createQontakCredential = (data: {
  token: string;
  description?: string | null;
  is_active?: boolean;
}) => {
  return client.post(baseEndpoint, data);
};

export const updateQontakCredential = (
  id: number | string,
  data: {
    token?: string;
    description?: string | null;
    is_active?: boolean;
  },
) => {
  return client.put(`${baseEndpoint}/${id}`, data);
};

export const setActiveQontakCredential = (id: number | string) => {
  return client.patch(`${baseEndpoint}/${id}/set-active`);
};

export const deleteQontakCredential = (id: number | string) => {
  return client.delete(`${baseEndpoint}/${id}`);
};

