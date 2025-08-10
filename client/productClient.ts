import client from "./apiClient";

export const getProducts = (params?: any) => {
  return client.get("/products", { params });
};

export const getAvailableProducts = () => {
  return client.get("/products/available");
};

export const getProductById = (id: string | number) => {
  return client.get(`/products/${id}`);
};

export const createProduct = (data: any) => {
  return client.post("/products", data);
};

export const updateProduct = (id: string | number, data: any) => {
  return client.patch(`/products/${id}`, data);
};

export const updateProductStatus = (id: string | number, data: any) => {
  return client.put(`/products/${id}/status`, data);
};

export const deleteProduct = (id: string | number) => {
  return client.delete(`/products/${id}`);
};

// Addons
export const getAddons = (params?: any) => {
  return client.get("/addons", { params });
};

export const getAddonById = (id: string | number) => {
  return client.get(`/addons/${id}`);
};

export const createAddon = (data: any) => {
  return client.post("/addons", data);
};

export const updateAddon = (id: string | number, data: any) => {
  return client.patch(`/addons/${id}`, data);
};

export const deleteAddon = (id: string | number) => {
  return client.delete(`/addons/${id}`);
};