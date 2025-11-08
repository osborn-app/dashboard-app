import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/paper-credentials";

export interface PaperCredential {
  id: number;
  client_id: string;
  client_secret: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useGetPaperCredentials = () => {
  const axiosAuth = useAxiosAuth();

  const getCredentials = async (): Promise<PaperCredential[]> => {
    const { data } = await axiosAuth.get(baseEndpoint);
    return data;
  };

  return useQuery({
    queryKey: ["paper-credentials"],
    queryFn: getCredentials,
  });
};

export const useCreatePaperCredential = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createCredential = async (payload: {
    client_id: string;
    client_secret: string;
    description?: string | null;
    is_active?: boolean;
  }) => {
    const { data } = await axiosAuth.post(baseEndpoint, payload);
    return data;
  };

  return useMutation({
    mutationFn: createCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper-credentials"] });
    },
  });
};

export const useUpdatePaperCredential = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateCredential = async ({
    id,
    data,
  }: {
    id: number | string;
    data: {
      client_id?: string;
      client_secret?: string;
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
      queryClient.invalidateQueries({ queryKey: ["paper-credentials"] });
    },
  });
};

export const useSetActivePaperCredential = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const setActive = async (id: number | string) => {
    const response = await axiosAuth.patch(`${baseEndpoint}/${id}/set-active`);
    return response.data;
  };

  return useMutation({
    mutationFn: setActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper-credentials"] });
    },
  });
};

export const useDeletePaperCredential = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteCredential = async (id: number | string) => {
    const response = await axiosAuth.delete(`${baseEndpoint}/${id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: deleteCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper-credentials"] });
    },
  });
};

