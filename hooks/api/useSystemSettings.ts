import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/system-settings";

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useGetSystemSettings = () => {
  const axiosAuth = useAxiosAuth();

  const getSettings = async (): Promise<SystemSetting[]> => {
    const { data } = await axiosAuth.get(baseEndpoint);
    return data;
  };

  return useQuery({
    queryKey: ["system-settings"],
    queryFn: getSettings,
  });
};

export const useCreateSystemSetting = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createSetting = async (payload: {
    key: string;
    value: string;
    type?: string;
    description?: string | null;
  }) => {
    const { data } = await axiosAuth.post(baseEndpoint, payload);
    return data;
  };

  return useMutation({
    mutationFn: createSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
};

export const useUpdateSystemSetting = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateSetting = async ({
    id,
    data,
  }: {
    id: number | string;
    data: {
      value?: string;
      type?: string;
      description?: string | null;
    };
  }) => {
    const response = await axiosAuth.put(`${baseEndpoint}/${id}`, data);
    return response.data;
  };

  return useMutation({
    mutationFn: updateSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
};

export const useUpdateSystemSettingByKey = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateByKey = async ({
    key,
    value,
  }: {
    key: string;
    value: string;
  }) => {
    const response = await axiosAuth.patch(`${baseEndpoint}/key/${key}`, {
      value,
    });
    return response.data;
  };

  return useMutation({
    mutationFn: updateByKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
};

export const useDeleteSystemSetting = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteSetting = async (id: number | string) => {
    const response = await axiosAuth.delete(`${baseEndpoint}/${id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: deleteSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
};

