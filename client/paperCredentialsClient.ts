import client from "./apiClient";

const baseEndpoint = "/paper-credentials";

export const getPaperCredentials = () => {
  return client.get(baseEndpoint);
};

export const getActivePaperCredential = () => {
  return client.get(`${baseEndpoint}/active`);
};

export const createPaperCredential = (data: {
  client_id: string;
  client_secret: string;
  description?: string | null;
  is_active?: boolean;
}) => {
  return client.post(baseEndpoint, data);
};

export const updatePaperCredential = (
  id: number | string,
  data: {
    client_id?: string;
    client_secret?: string;
    description?: string | null;
    is_active?: boolean;
  },
) => {
  return client.put(`${baseEndpoint}/${id}`, data);
};

export const setActivePaperCredential = (id: number | string) => {
  return client.patch(`${baseEndpoint}/${id}/set-active`);
};

export const deletePaperCredential = (id: number | string) => {
  return client.delete(`${baseEndpoint}/${id}`);
};

