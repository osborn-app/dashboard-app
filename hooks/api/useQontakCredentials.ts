import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/qontak-credentials";

export interface QontakCredential {
  id: number;
  token: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useGetQontakCredentials = () => {
  const axiosAuth = useAxiosAuth();

  const getCredentials = async (): Promise<QontakCredential[]> => {
    const { data } = await axiosAuth.get(baseEndpoint);
    return data;
  };

  return useQuery({
    queryKey: ["qontak-credentials"],
    queryFn: getCredentials,
  });
};

export const useCreateQontakCredential = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createCredential = async (payload: {
    token: string;
    description?: string | null;
    is_active?: boolean;
  }) => {
    const { data } = await axiosAuth.post(baseEndpoint, payload);
    return data;
  };

  return useMutation({
    mutationFn: createCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qontak-credentials"] });
    },
  });
};

export const useUpdateQontakCredential = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateCredential = async ({
    id,
    data,
  }: {
    id: number | string;
    data: {
      token?: string;
      description?: string | null;
      is_active?: boolean;
    };
  }) => {
    const response = await axiosAuth.put(`${baseEndpoint}/${id}`, data);
    return response.data;
  };

  return useMutation({
    mutationFn: updateCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qontak-credentials"] });
    },
  });
};

export const useSetActiveQontakCredential = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const setActive = async (id: number | string) => {
    const response = await axiosAuth.patch(`${baseEndpoint}/${id}/set-active`);
    return response.data;
  };

  return useMutation({
    mutationFn: setActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qontak-credentials"] });
    },
  });
};

export const useDeleteQontakCredential = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteCredential = async (id: number | string) => {
    const response = await axiosAuth.delete(`${baseEndpoint}/${id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: deleteCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qontak-credentials"] });
    },
  });
};

