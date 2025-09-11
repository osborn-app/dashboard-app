import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/perencanaan";

interface GetPerencanaanParams {
  page: number;
  limit: number;
  q?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  order_by?: string;
  order_column?: string;
}

export const useGetPerencanaan = (params: GetPerencanaanParams) => {
  const axiosAuth = useAxiosAuth();

  const getPerencanaan = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["perencanaan", params],
    queryFn: getPerencanaan,
  });
};

export const useGetDetailPerencanaan = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getDetailPerencanaan = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["perencanaan", id],
    queryFn: getDetailPerencanaan,
  });
};

export const usePostPerencanaan = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postPerencanaan = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postPerencanaan,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["perencanaan"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perencanaan"] });
    },
  });
};

export const useEditPerencanaan = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editPerencanaan = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editPerencanaan,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["perencanaan"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perencanaan"] });
    },
  });
};

export const useDeletePerencanaan = (id: number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deletePerencanaan = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deletePerencanaan,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["perencanaan"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perencanaan"] });
    },
  });
};

export const usePerencanaanStatistics = () => {
  const axiosAuth = useAxiosAuth();
  const getStatistics = () => {
    return axiosAuth.get(`${baseEndpoint}/statistics`);
  };

  return useQuery({
    queryKey: ["perencanaan-statistics"],
    queryFn: getStatistics,
  });
};
