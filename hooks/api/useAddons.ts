import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

interface GetAddonsParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
}

// Hook untuk product addons
export const useGetProductAddons = (params: GetAddonsParams = {}) => {
  const axiosAuth = useAxiosAuth();

  const getProductAddons = async () => {
    const { data } = await axiosAuth.get("/addons/products", {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["addons", "products", params],
    queryFn: getProductAddons,
  });
};

// Hook untuk fleet addons
export const useGetFleetAddons = (params: GetAddonsParams = {}) => {
  const axiosAuth = useAxiosAuth();

  const getFleetAddons = async () => {
    const { data } = await axiosAuth.get("/addons/fleets", {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["addons", "fleets", params],
    queryFn: getFleetAddons,
  });
};

// Hook lama untuk backward compatibility
export const useGetAddons = (params: GetAddonsParams = {}) => {
  const axiosAuth = useAxiosAuth();

  const getAddons = async () => {
    const { data } = await axiosAuth.get("/addons", {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["addons", params],
    queryFn: getAddons,
  });
};
