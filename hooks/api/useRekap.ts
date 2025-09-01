import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

export const useGetOrderanSewa = (params?: any, options?: {}) => {
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: ["orderan-sewa", params],
    queryFn: () =>
      axiosAuth.get("/rekap-transaksi/orderan-sewa", { params }).then((res) => res.data),
    ...options,
  });
};

export const useGetReimburse = (params?: any, options?: {}) => {
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: ["reimburse", params],
    queryFn: () =>
      axiosAuth.get("/rekap-transaksi/reimburse", { params }).then((res) => res.data),
    ...options,
  });
};

export const useGetInventaris = (params?: any, options?: {}) => {
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: ["inventaris", params],
    queryFn: () =>
      axiosAuth.get("/rekap-transaksi/inventaris", { params }).then((res) => res.data),
    ...options,
  });
};

export const useGetLainnya = (params?: any, options?: {}) => {
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: ["lainnya", params],
    queryFn: () =>
      axiosAuth.get("/rekap-transaksi/lainnya", { params }).then((res) => res.data),
    ...options,
  });
};

export const useCreateLainnya = () => {
  const axiosAuth = useAxiosAuth();

  return useMutation({
    mutationFn: (data: any) => axiosAuth.post(`/rekap-transaksi/lainnya`, data),
  });
};

export const useDeleteLainnya = () => {
  const axiosAuth = useAxiosAuth();

  return useMutation({
    mutationFn: (id: string) => axiosAuth.delete(`/rekap-transaksi/lainnya/${id}`),
  });
};

export const useEditLainnya = () => {
  const axiosAuth = useAxiosAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      axiosAuth.patch(`/rekap-transaksi/lainnya/${id}`, data),
  });
};

export const useGetOrderanSewaById = (id: string, params?: any) => {
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: ["orderan-sewa-by-id", id, params],
    queryFn: () =>
      axiosAuth.get(`/rekap-transaksi/orderan-sewa/${id}`, { params }).then((res) => res.data),
  });
};

export const useGetLainnyaById = (id: string, params?: any) => {
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: ["lainnya-by-id", id, params],
    queryFn: () =>
      axiosAuth.get(`/rekap-transaksi/lainnya/${id}`, { params }).then((res) => res.data),
  });
};