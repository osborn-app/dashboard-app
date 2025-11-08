import client from "./apiClient";

const baseEndpoint = "/system-settings";

export const getSystemSettings = () => {
  return client.get(baseEndpoint);
};

export const createSystemSetting = (data: {
  key: string;
  value: string;
  type?: string;
  description?: string | null;
}) => {
  return client.post(baseEndpoint, data);
};

export const updateSystemSetting = (
  id: number | string,
  data: {
    value?: string;
    type?: string;
    description?: string | null;
  },
) => {
  return client.put(`${baseEndpoint}/${id}`, data);
};

export const updateSystemSettingByKey = (key: string, value: string) => {
  return client.patch(`${baseEndpoint}/key/${key}`, { value });
};

export const deleteSystemSetting = (id: number | string) => {
  return client.delete(`${baseEndpoint}/${id}`);
};

