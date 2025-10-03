import client from "./apiClient";

// Get paginated brands
export const getBrands = (params: any = {}) => {
  return client.get("/brands", { params });
};

// Get brands list for dropdown (cached)
export const getBrandsList = () => {
  return client.get("/brands/list");
};

// Get single brand by ID
export const getBrandById = (id: string | number) => {
  return client.get(`/brands/${id}`);
};

// Create brand (Admin only)
export const createBrand = (data: { name: string }) => {
  return client.post("/brands", data);
};

// Update brand (Admin only)
export const updateBrand = (id: string | number, data: { name: string }) => {
  return client.patch(`/brands/${id}`, data);
};

// Delete brand (Admin only)
export const deleteBrand = (id: string | number) => {
  return client.delete(`/brands/${id}`);
};
