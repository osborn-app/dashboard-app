import client from "./apiClient";

export const getUsers = (params?: { role?: string; page?: number; limit?: number; q?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.append("role", params.role);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.q) queryParams.append("q", params.q);
  
  return client.get(`/users?${queryParams.toString()}`);
};

export const getUserById = (id: string | number) => {
  return client.get(`/users/${id}`);
};

export const deleteUser = (id: string | number) => {
  return client.delete(`/users/${id}`);
};

export const registerUser = (data: {
  name: string;
  email: string;
  role: string;
  phone_number: string;
  password: string;
}) => {
  return client.post("/auth/register", data);
};
