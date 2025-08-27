import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/addons";

interface GetAddonsParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}
// triger
export const useGetAddons = (params: GetAddonsParams = {}) => {
  const axiosAuth = useAxiosAuth();

  const getAddons = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["addons", params],
    queryFn: getAddons,
  });
};
