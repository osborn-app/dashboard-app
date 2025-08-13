import client from "./apiClient";

export const getOrders = (params?: any) => {
  return client.get("/orders", { 
    params: { 
      ...params, 
      order_type: "vehicle" 
    } 
  });
};

export const getProductOrders = (params?: any) => {
  return client.get("/orders", { 
    params: { 
      ...params, 
      order_type: "product" 
    } 
  });
};

export const getOrderById = (id: string | number) => {
  return client.get(`/orders/${id}`);
};

export const createOrder = (data: any) => {
  return client.post("/orders", data);
};

export const updateOrder = (id: string | number, data: any) => {
  return client.patch(`/orders/${id}`, data);
};

export const approveOrder = (id: string | number) => {
  return client.put(`/orders/${id}/approve`);
};

export const rejectOrder = (id: string | number, data: { reason: string }) => {
  return client.post(`/orders/${id}/reject`, data);
};

export const deleteOrder = (id: string | number) => {
  return client.delete(`/orders/${id}`);
};
