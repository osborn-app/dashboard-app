import client from "./apiClient";

export const getOrderanSewa = (params?: any) => {
  return client.get("/rekap-transaksi/orderan-sewa", { params });
};

export const getReimburse = (params?: any) => {
  return client.get("/rekap-transaksi/reimburse", { params });
};

export const getInventaris = (params?: any) => {
  return client.get("/rekap-transaksi/inventaris", { params });
};

export const getLainnya = (params?: any) => {
  return client.get("/rekap-transaksi/lainnya", { params });
};

export const getOrderanSewaById = (id: string, params?: any) => {
  return client.get(`/rekap-transaksi/orderan-sewa/${id}`, { params });
};

export const getLainnyaById = (id: string, params?: any) => {
  return client.get(`/rekap-transaksi/lainnya/${id}`, { params });
};

export const createLainnya = (data: any) => {
  return client.post(`/rekap-transaksi/lainnya`, data);
};

export const deleteLainnya = (id: string) => {
  return client.delete(`/rekap-transaksi/lainnya/${id}`);
};

export const editLainnya = (id: string, data: any) => {
  return client.patch(`/rekap-transaksi/lainnya/${id}`, data);
};